
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

document.addEventListener('DOMContentLoaded', async function() {

    function getResetData() {
		const userEmail = document.getElementById('reset-email')?.value || '';
		return { 
            userEmail
        };
	};

    const resetBtn = document.getElementById('reset-btn');

    /* 检查输入框是否存在内容，没有则显示警告 */
    let allFilled = true;

    resetBtn.addEventListener('click', async () => {
        
        allFilled = true;

        const inputData = getResetData();

        if (inputData.userEmail === '') {
			allFilled = false;
			const warningLabel = document.getElementById(`reset-email-blank`);
			warningLabel.style.display = 'block';
		} else {
			const warningLabel = document.getElementById(`reset-email-blank`);
			warningLabel.style.display = 'none';
		}

	    if (!allFilled) return;

        /* 加载图标 */
        const loadingIcon = document.getElementById(`loading-icon`);
        if (loadingIcon) loadingIcon.style.display = 'block';

        const redirectUrl = `https://wuresgrp.github.io/reset2`;
		const { resetError } = await supabase.auth.resetPasswordForEmail(inputData.userEmail, {
            redirectTo: redirectUrl
        });

        if (resetError) {
            alert(`Failed to sent the password reset link: ${resetError}`);
            return;
        } else {
            alert(`If that email is registered, we'll send a password reset link. Please check your email ${data.userEmail}.`);
        }

        if (loadingIcon) loadingIcon.style.display = 'none';
    });




});
