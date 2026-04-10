
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

import { downloadMasking } from"../download.js"

const fileNames = [
    "test.txt", "test1.txt", "test2.txt",
];

document.addEventListener('DOMContentLoaded', async function() {

    const downloadBtn = document.getElementById('FFF-download');

    downloadBtn.addEventListener('click', async () => {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (user) {
            downloadMasking(user, fileNames);
        } else {
            sessionStorage.setItem("post_login_next", window.location.href);
            window.location.href = '/login/';
        }

    });

});


