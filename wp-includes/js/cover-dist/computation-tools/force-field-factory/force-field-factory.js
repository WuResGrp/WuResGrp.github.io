
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

import { downloadMasking } from"../download.js"

const fileNames = [
    "Force Field Factory/FFF_2.0.tar",
    "Force Field Factory/Force Field Factory V2.0 Manual.pdf",
];

const commentLabels = [
    "Executable : ",
    "Manual : ",
    /* `<span style="font-style: italic">Tinker</span> parameter file : ` */
];

/* 本页面全部文件归属的资源名称；下载前按用户 metadata 中批准的 resources 校验 */
const requiredResource = "Force Field Factory";

/* ==================== 临时公告模式（默认关闭） ====================
   【用途】如需再次临时关闭 FFF 下载（例如源码暂不开放），把 NOTICE_ONLY 改回 true，
   点击 Download 即弹出提示弹窗（文案见 FFF_NOTICE_HTML），跳过登录/授权/下载流程。
   恢复正常下载：改回 false。 */
const NOTICE_ONLY = false;

const FFF_NOTICE_HTML =
    'The source code of Force Field Factory is not available on this website. You can send an email to ' +
    '<a href="mailto:xpwu@ecust.edu.cn">xpwu@ecust.edu.cn</a>' +
    ' to request it.';

function showNoticeModal() {
    const masking = document.getElementById('download-masking');
    const modal = document.getElementById('download-modal');
    const userName = document.getElementById('download-user-name');
    const options = document.getElementById('download-options');
    const userInfo = document.getElementById('user-info-div');
    if (!masking || !modal) return;

    userName.textContent = 'Notice';
    options.innerHTML = `<p class="fff-notice-text">${FFF_NOTICE_HTML}</p>`;
    if (userInfo) userInfo.style.display = 'none'; // 公告模式不显示退出登录按钮
    masking.onclick = (e) => {
        if (!modal.contains(e.target)) masking.classList.remove('is-open'); // 点弹窗外部关闭
    };
    masking.classList.add('is-open');
}

document.addEventListener('DOMContentLoaded', async function() {

    const downloadBtn = document.getElementById('FFF-download');

    downloadBtn.addEventListener('click', async () => {
        // 临时公告模式：FFF 源码暂不开放（恢复方法见 NOTICE_ONLY 定义处注释）
        if (NOTICE_ONLY) {
            showNoticeModal();
            return;
        }

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


