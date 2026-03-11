
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

async function handleDownload(fileName) {
    try {
        const overlayDiv = document.getElementById(`overlay`);
        if (overlayDiv) overlayDiv.style.display = "block";
        const { data, error } = await supabase.storage
            .from('computation-tools')
            .createSignedUrl(fileName, 300);
        if (error) {
            alert(`Failed to download: ${error.message}`);
            return;
        }
        if (overlayDiv) overlayDiv.style.display = "none";
        const headResponse = await fetch(data.signedUrl, { method: 'HEAD' });
        if (!headResponse.ok) {
            const link = document.createElement('a');
            link.href = data.signedUrl;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            return;
        }
        const contentType = headResponse.headers.get('content-type') || '';
        const link = document.createElement('a');
        link.download = fileName; 
        if (contentType.startsWith('text/') || contentType.startsWith('image/')) {
            const response = await fetch(data.signedUrl);
            if (!response.ok) {
                alert('Download failed.');
                return;
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            link.href = url;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } else {
            link.href = data.signedUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    } catch (err) {
        if (overlayDiv) overlayDiv.style.display = "none";
        alert('Download failed.');
    }
}

export async function downloadMasking(user, fileNames) {

    const downloadUserName = document.getElementById('download-user-name');
    const downloadMasking = document.getElementById('download-masking');
    const downloadModal = document.getElementById("download-modal");
	
    const names = [
		user.user_metadata.firstName,
		user.user_metadata.middleInitial,
		user.user_metadata.lastName
	].filter(Boolean); // 过滤掉空字符串、null、undefined 等假值
    downloadUserName.innerText = `Welcome, ${names.join(' ')}.`

    downloadMasking.classList.add("is-open");
    downloadMasking.addEventListener("click", (e) => {
        if (!downloadModal.contains(e.target)) downloadMasking.classList.remove("is-open");
    });

    const downloadOptions = document.getElementById('download-options');
    let htmlString = '';
    fileNames.forEach((file, index) => {
        htmlString += `
            <div class="download-group">
                <label>${file}</label>
                <button id="btn-${index}" data-index="${index}">Download
                    <span id="download-btn-${index}-loading-icon" class="spinner"></span>
                </button>
            </div>
        `;

    });

    downloadOptions.innerHTML = htmlString;
    
    fileNames.forEach((file, index) => {
        const downloadBtn = document.getElementById(`btn-${index}`);
        const downloadLoadingIcon = document.getElementById(`download-btn-${index}-loading-icon`);

        downloadBtn.addEventListener("click", async () => {
            downloadBtn.setAttribute("disabled", "");
            downloadLoadingIcon.style.display = "inline-flex";

            await handleDownload(file);

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

