
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

import { downloadMasking } from"../download.js"

const fileNames = [
    "Force Field Factory/force_field_factory_1.0.tar.gz",
    "Force Field Factory/manual_force_field_factory_v1.0.pdf",
];

const commentLabels = [
    "Executable : ",
    "Manual : ",
    /* `<span style="font-style: italic">Tinker</span> parameter file : ` */
];

/* 本页面全部文件归属的资源名称；下载前按用户 metadata 中批准的 resources 校验 */
const requiredResource = "Force Field Factory";

/* ==================== 临时公告模式（FFF 源码暂不开放） ====================
   点击 Download 不再走登录/授权/下载流程，改为弹出提示弹窗。
   【恢复方法】把下方 NOTICE_ONLY 改回 false 即可恢复原有
   “登录 → accessed_resources 校验 → 下载弹窗”流程，原逻辑全部保留未删。
   （如需连提示弹窗代码一起清除，git 历史中有未加公告前的完整版本。） */
const NOTICE_ONLY = true;

const FFF_NOTICE_HTML =
    'The source code of Force Field Factory is not available on this website yet. You can send an email to ' +
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


