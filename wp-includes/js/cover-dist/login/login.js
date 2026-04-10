
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);


document.addEventListener('DOMContentLoaded', async function() {

	const { data: { session } } = await supabase.auth.getSession();
	const user = session?.user;
	if (user) {
		window.location.href = '/computation-tools/';
	};

    function getSignInData() {
		const userEmail = document.getElementById('log-in-email')?.value || '';
		const userPwd = document.getElementById('log-in-password')?.value || '';
		return { 
            userEmail, 
            userPwd 
        };
	};
    
	/* 检查输入框是否存在内容，没有则显示警告 */
    let allFilled = true;

    const logInBtn = document.getElementById('log-in-btn');

    logInBtn.addEventListener('click', async () => {
        logInBtn.setAttribute("disabled", "");
		allFilled = true;

		const inputData = getSignInData();

		if (inputData.userEmail === '') {
			allFilled = false;
			const warningLabel = document.getElementById(`log-in-email-blank`);
			warningLabel.style.display = 'block';
		} else {
			const warningLabel = document.getElementById(`log-in-email-blank`);
			warningLabel.style.display = 'none';
		}

		if (inputData.userPwd === '') {
			allFilled = false;
			const warningLabel = document.getElementById(`log-in-password-blank`);
			warningLabel.style.display = 'block';
		} else {
			const warningLabel = document.getElementById(`log-in-password-blank`);
			warningLabel.style.display = 'none';
		}

		if (!allFilled) {
			logInBtn.removeAttribute("disabled");
			return;
		}
		/* 加载图标 */
        const loadingIcon = document.getElementById(`loading-icon`);
        if (loadingIcon) loadingIcon.style.display = 'block';

        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: inputData.userEmail,
            password: inputData.userPwd
        });


		if (signInError) {
			alert(`Failed to sign in: ${signInError.message}`);
			if (loadingIcon) loadingIcon.style.display = 'none';
			logInBtn.removeAttribute("disabled");
			return;
		} else {
			const names = [
				signInData.user.user_metadata.firstName,
				signInData.user.user_metadata.middleInitial,
				signInData.user.user_metadata.lastName
			].filter(Boolean); // 过滤掉空字符串、null、undefined 等假值
			alert(`Welcome, ${names.join(' ')}`);
		}
		
		const next = sessionStorage.getItem("post_login_next");
		sessionStorage.removeItem("post_login_next");
		window.location.replace(next && next.trim() ? next : '/computation-tools/');
		
    });

	const forgotBtn = document.getElementById('forgot-pwd-btn');

	forgotBtn.addEventListener('click', async () => {
        window.location.href = '/reset1/';
    });

	const signUpBtn = document.getElementById('sign-up-btn');

	signUpBtn.addEventListener('click', async () => {
        window.location.href = '/signup/';
    });

});

