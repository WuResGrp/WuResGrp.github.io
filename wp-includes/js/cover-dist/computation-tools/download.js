
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co',
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

/* 文件 → 资源 归属表；新增可下载文件时必须在此登记，未登记的文件默认拒绝下载 */
const FILE_RESOURCE_MAP = {
	"force_field_factory_1.0.tar.gz": "Force Field Factory",
	"manual_force_field_factory_v1.0.pdf": "Force Field Factory",
	"MODEX.prm": "MODEX",
};

async function handleDownload(user, fileName) {
    const overlayDiv = document.getElementById(`overlay`);

    try {
        /* 与 Storage RLS 策略保持一致的二次校验：未授权的资源转去重新申请页 */
        const grantedResources = user.user_metadata?.accessed_resources || [];
        const ownerResource = FILE_RESOURCE_MAP[fileName];
        if (ownerResource === undefined || !grantedResources.includes(ownerResource)) {
            if (ownerResource !== undefined) {
                sessionStorage.setItem("reapply_resource", ownerResource);
            }
            window.location.href = '/reapply/';
            return;
        }

        if (overlayDiv) overlayDiv.style.display = "block";

        const { data, error } = await supabase.storage
            .from('computation-tools')
            .createSignedUrl(fileName, 300, {
                download: fileName
            });

        if (error) {
            console.error(error);
            alert("Download failed: your account may not have access to this file. Please contact the administrator if you believe this is a mistake.");
            return;
        }

        const response = await fetch(data.signedUrl);

        if (!response.ok) {
            alert('Download failed.');
            return;
        }

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);

    } catch (err) {
        console.error(err);
        alert('Download failed.');
    } finally {
        if (overlayDiv) overlayDiv.style.display = "none";
    }
}

export async function downloadMasking(user, fileNames, commentLabels = []) {

    /* 双重保险：即使工具页漏检，也按文件归属与已授权的 accessed_resources 过滤下载列表 */
    const grantedResources = user.user_metadata?.accessed_resources || [];
    const allowedEntries = fileNames
        .map((file, index) => ({ file, index }))
        .filter(({ file }) => {
            const ownerResource = FILE_RESOURCE_MAP[file];
            return ownerResource !== undefined && approvedResources.includes(ownerResource);
        });

    if (allowedEntries.length === 0) {
        /* 没有任何已授权文件：转到重新申请页 */
        window.location.href = '/reapply/';
        return;
    }

    const downloadUserName = document.getElementById('download-user-name');
    const downloadMasking = document.getElementById('download-masking');
    const downloadModal = document.getElementById("download-modal");
	
    const names = [
        user.user_metadata.firstName,
        user.user_metadata.middleInitial,
        user.user_metadata.lastName
    ].filter(Boolean);

    downloadUserName.innerText = `Welcome, ${names.join(' ')}.`;

    downloadMasking.classList.add("is-open");

    downloadMasking.addEventListener("click", (e) => {
        if (!downloadModal.contains(e.target)) {
            downloadMasking.classList.remove("is-open");
        }
    });

    const downloadOptions = document.getElementById('download-options');
    let htmlString = '';

    allowedEntries.forEach(({ file, index }) => {
        const comment = commentLabels[index] || '';

        htmlString += `
            <div class="download-group">
                <label class="download-comment-label">
                    <strong>${comment}</strong>
                </label>

                <div class="download-file-row">
                    <label>${file}</label>
                    <button id="btn-${index}" data-index="${index}">
                        Download
                        <span id="download-btn-${index}-loading-icon" class="spinner"></span>
                    </button>
                </div>
            </div>
        `;
    });

    downloadOptions.innerHTML = htmlString;

    allowedEntries.forEach(({ file, index }) => {
        const downloadBtn = document.getElementById(`btn-${index}`);
        const downloadLoadingIcon = document.getElementById(`download-btn-${index}-loading-icon`);

        downloadBtn.addEventListener("click", async () => {
            downloadBtn.setAttribute("disabled", "");
            downloadLoadingIcon.style.display = "inline-flex";

            await handleDownload(user, file);

            downloadLoadingIcon.style.display = "none";
            downloadBtn.removeAttribute("disabled");
        });
    });

    const logOutBtn = document.getElementById("log-out-btn");
    const logOutLoadingIcon = document.getElementById("log-out-loading-icon");

    logOutBtn.addEventListener("click", async () => {
        logOutBtn.setAttribute("disabled", "");
        logOutLoadingIcon.style.display = "inline-flex";
        
        await supabase.auth.signOut({ scope: 'local' });
        
        logOutLoadingIcon.style.display = "none";
        downloadMasking.classList.remove("is-open");
        logOutBtn.removeAttribute("disabled");
    });

}

