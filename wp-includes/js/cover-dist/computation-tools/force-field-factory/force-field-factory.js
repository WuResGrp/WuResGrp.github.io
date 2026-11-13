
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

import { downloadMasking } from"../download.js"

const fileNames = [
    "force_field_factory_1.0.tar.gz", 
    "manual_force_field_factory_v1.0.pdf", 
    /* "MODEX.prm", */
];

const commentLabels = [
    "Executable : ",
    "Manual : ",
    /* `<span style="font-style: italic">Tinker</span> parameter file : ` */
];

/* 本页面全部文件归属的资源名称；下载前按用户 metadata 中批准的 resources 校验 */
const requiredResource = "Force Field Factory";

document.addEventListener('DOMContentLoaded', async function() {

    const downloadBtn = document.getElementById('FFF-download');

    downloadBtn.addEventListener('click', async () => {
        // getUser() 实时读取服务端用户资料，管理员授权后无需重新登录即可生效
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            sessionStorage.setItem("post_login_next", window.location.href);
            window.location.href = '/login/';
            return;
        }

        // accessed_resources 是管理员授权键；未授权则转到重新申请页，并携带资源名供预勾选
        const grantedResources = user.user_metadata?.accessed_resources || [];
        if (!grantedResources.includes(requiredResource)) {
            sessionStorage.setItem("reapply_resource", requiredResource);
            window.location.href = '/reapply/';
            return;
        }

        downloadMasking(user, fileNames, commentLabels);
    });

});


