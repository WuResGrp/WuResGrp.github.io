
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

    const logInBtn = document.getElementById('log-in-btn');

    logInBtn.addEventListener('click', async () => {
        window.location.href = 'https://wuresgrp.github.io/login/';
    });

    const resetBtn = document.getElementById('reset-btn');

    /* 检查输入框是否存在内容，没有则显示警告 */
    let allFilled = true;

    resetBtn.addEventListener('click', async () => {
        
        resetBtn.setAttribute("disabled", "");
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

        const functionUrl = 'https://becwqxslretdluxtjfwb.supabase.co/functions/v1/admin';

        try {
            const response = await fetch(functionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: "check_if_existed",
                payload: {
                email: inputData.userEmail
                }
            })
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.error && result.error.includes("not registered")) {
                    alert("❌ This email is not registered!");
                } else {
                    alert(`❌ Failed: ${result.error || 'Unknown error'}`);
                }
                if (loadingIcon) loadingIcon.style.display = 'none';
                resetBtn.removeAttribute("disabled");
                return null;
            }

            const redirectUrl = `https://wuresgrp.github.io/reset2`;
            const { resetError } = await supabase.auth.resetPasswordForEmail(inputData.userEmail, {
                redirectTo: redirectUrl
            });

            if (resetError) {
                alert(`❌ Failed to sent the password reset link: ${resetError}`);
                resetBtn.removeAttribute("disabled");
                return;
            } 
            
            alert("✅ Successful! Please wait for admin approval before receiving the reset email.");
            console.log("Registration response:", result);
            if (loadingIcon) loadingIcon.style.display = 'none';
            resetBtn.removeAttribute("disabled");
            return result;

        } catch (err) {
            console.error(err);
            alert("❌ Network error, please try again later.");
            if (loadingIcon) loadingIcon.style.display = 'none';
            resetBtn.removeAttribute("disabled");
            return null;
        }

        
    });


});
