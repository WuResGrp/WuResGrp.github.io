
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

async function handleDownload(fileName) {
    const overlayDiv = document.getElementById(`overlay`);

    try {
        if (overlayDiv) overlayDiv.style.display = "block";

        const { data, error } = await supabase.storage
            .from('computation-tools')
            .createSignedUrl(fileName, 300, {
                download: fileName
            });

        if (error) {
            alert(`Failed to download: ${error.message}`);
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

    fileNames.forEach((file, index) => {
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

