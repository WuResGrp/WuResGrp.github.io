
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

document.addEventListener('DOMContentLoaded', async function() {

    function getUpdateData() {
		const password = document.getElementById('update-password')?.value || '';
        const confirmPassword = document.getElementById('update-confirm-password')?.value || '';
		return { 
            password, 
            confirmPassword
        };
	};

    /* 检查输入框是否存在内容，没有则显示警告 */
    let allFilled = true;

    const resetBtn = document.getElementById('update-btn');

    resetBtn.addEventListener('click', async () => {

        allFilled = true;

        const inputData = getUpdateData();

        if (inputData.password === '') {
            allFilled = false;
            const warningLabel = document.getElementById(`update-password-blank`);
            warningLabel.style.display = 'block';
        } else {
            const warningLabel = document.getElementById(`update-password-blank`);
            warningLabel.style.display = 'none';
        }

        if (inputData.confirmPassword === '') {
            allFilled = false;
            const warningLabel = document.getElementById(`update-confirm-password-blank`);
            warningLabel.style.display = 'block';
        } else {
            const warningLabel = document.getElementById(`update-confirm-password-blank`);
            warningLabel.style.display = 'none';
        }

        if (inputData.confirmPassword !== inputData.password) {
            allFilled = false;
            const warningLabel = document.getElementById(`update-confirm-password-notmatch`);
            if (warningLabel) warningLabel.style.display = 'block';
        } else {
            const warningLabel = document.getElementById(`update-confirm-password-notmatch`);
            if (warningLabel) warningLabel.style.display = 'none';
        }

        if (!allFilled) return;

        /* 加载图标 */
        const loadingIcon = document.getElementById(`loading-icon`);
        if (loadingIcon) loadingIcon.style.display = 'block';

		const { updateError } = await supabase.auth.updateUser({
			password: inputData.password
		})

        if (updateError) {
			alert(`Password update failed: ${updateError}`);
            if (loadingIcon) loadingIcon.style.display = 'none';
		} else {
			alert(`Password updated successfully! Please sign in with your new password.`);
            await supabase.auth.signOut({ scope: 'local' });
		}

        window.location.href = 'https://wuresgrp.github.io/';

    });


});

