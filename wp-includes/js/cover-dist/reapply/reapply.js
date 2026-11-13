
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

/* 将用户已申请/已获授权的资源渲染为勾选并禁用（不可重复申请）；
   工具页跳转时通过 sessionStorage.reapply_resource 携带想补申请的资源名 */
function applyUserState(metadata) {
	const applied = Array.isArray(metadata.resources) ? metadata.resources : [];
	const granted = Array.isArray(metadata.accessed_resources) ? metadata.accessed_resources : [];
	const owned = new Set([...applied, ...granted]);

	document.querySelectorAll('.sign-up-resource').forEach(checkbox => {
		if (owned.has(checkbox.value)) {
			checkbox.checked = true;
			checkbox.disabled = true;
			checkbox.closest('.sign-up-checkbox-item')?.classList.add('disabled-resource');
		}
	});

	const requested = sessionStorage.getItem('reapply_resource');
	if (requested) {
		sessionStorage.removeItem('reapply_resource');
		const target = document.querySelector(`.sign-up-resource[value="${requested}"]`);
		if (target && !target.disabled) target.checked = true;
	}

	if (metadata.usageType) {
		const usageSelect = document.getElementById('sign-up-usage-type');
		if (usageSelect && [...usageSelect.options].some(option => option.value === metadata.usageType)) {
			usageSelect.value = metadata.usageType;
		}
	}
}

/* 收集表单输入并切换警告提示；返回 null 表示校验未通过。
   已申请/已授权的勾选框处于 disabled 状态，必须排除在本次申请之外 */
function collectForm() {
	const newResources = Array.from(document.querySelectorAll('.sign-up-resource:checked:not(:disabled)')).map(cb => cb.value);
	const usageType = document.getElementById('sign-up-usage-type')?.value || '';
	const description = document.getElementById('sign-up-purpose')?.value || '';

	const checks = [
		{ ok: newResources.length > 0, warningId: 'sign-up-resources-blank' },
		{ ok: usageType !== '', warningId: 'sign-up-usage-type-blank' },
		{ ok: description.trim() !== '', warningId: 'sign-up-purpose-blank' },
	];

	let allFilled = true;
	checks.forEach(({ ok, warningId }) => {
		const warning = document.getElementById(warningId);
		if (!ok) {
			allFilled = false;
			if (warning) warning.style.display = 'block';
		} else {
			if (warning) warning.style.display = 'none';
		}
	});

	if (!allFilled) return null;
	return { resources: newResources, usageType, description: description.trim() };
}

document.addEventListener('DOMContentLoaded', async function() {

	const submitBtn = document.getElementById('sign-up-btn');

	if (window.__REAPPLY_TEST__) return; /* 测试环境跳过自动初始化 */

	/* 本页仅面向已登录用户；未登录先去登录页，登录后回到本页 */
	let user = null;
	try {
		const { data, error } = await supabase.auth.getUser();
		user = error ? null : (data?.user || null);
	} catch {
		user = null;
	}

	if (!user) {
		sessionStorage.setItem("post_login_next", window.location.href);
		window.location.href = '/login/';
		return;
	}

	applyUserState(user.user_metadata || {});

	submitBtn.addEventListener('click', async () => {

		const formData = collectForm();
		if (!formData) return;

		const { data: { session } } = await supabase.auth.getSession();
		if (!session?.access_token) {
			sessionStorage.setItem("post_login_next", window.location.href);
			window.location.href = '/login/';
			return;
		}

		submitBtn.setAttribute("disabled", "");
		const loadingIcon = document.getElementById('loading-icon');
		if (loadingIcon) loadingIcon.style.display = 'block';

		try {
			const functionUrl = 'https://becwqxslretdluxtjfwb.supabase.co/functions/v1/admin';
			const response = await fetch(functionUrl, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${session.access_token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					action: "reapply",
					payload: formData
				})
			});

			const result = await response.json();

			if (!response.ok) {
				alert(`❌ Request failed: ${result.error || 'Unknown error'}`);
				submitBtn.removeAttribute("disabled");
				if (loadingIcon) loadingIcon.style.display = 'none';
				return;
			}

			alert("✅ Your request has been submitted. We will review it and update your download access soon.");
			window.location.href = '/';

		} catch (err) {
			console.error(err);
			alert("Network error, please try again later.");
			submitBtn.removeAttribute("disabled");
			if (loadingIcon) loadingIcon.style.display = 'none';
		}
	});

});

/* 测试钩子：仅供本地测试环境（设置 __REAPPLY_TEST__）检查内部逻辑 */
if (window.__REAPPLY_TEST__) {
	window.__reapplyHooks = { applyUserState, collectForm };
}
