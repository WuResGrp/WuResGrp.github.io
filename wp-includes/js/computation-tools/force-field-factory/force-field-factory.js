
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

document.addEventListener('DOMContentLoaded', async function() {

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

    const downloadBtn = document.getElementById('FFF-download');

    downloadBtn.addEventListener('click', async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (user) {
            handleDownload('test.txt')
        } else {
            window.location.href = 'https://wuresgrp.github.io/login';
        }

    });

});

