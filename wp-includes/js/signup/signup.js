
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

document.addEventListener('DOMContentLoaded', async function() {

    function getSignUpFormData() {
        const email = document.getElementById('sign-up-email')?.value || '';
        const password = document.getElementById('sign-up-password')?.value || '';
        const confirmPassword = document.getElementById('sign-up-confirm-password')?.value || '';
        const firstName = document.getElementById('sign-up-first-name')?.value || '';
        const middleInitial = document.getElementById('sign-up-middle-initial')?.value || '';
        const lastName = document.getElementById('sign-up-last-name')?.value || '';
        const country = document.getElementById('sign-up-country')?.value || '';
        const institution = document.getElementById('sign-up-institution')?.value || '';
        const groupLeader = document.getElementById('sign-up-leader')?.value || '';

        const purpose = document.getElementById('sign-up-purpose')?.value || '';

        return {
            email,
            password,
            confirmPassword,
            firstName,
            middleInitial,
            lastName,
            country,
            institution,
            groupLeader,
            purpose
        };
    };

    const registerBtn = document.getElementById('sign-up-btn');

    /* 检查输入框是否存在内容，没有则显示警告 */
    let allFilled = true;

    registerBtn.addEventListener('click', async () => {
        
        allFilled = true;

        const requiredFieldIds = [
            'sign-up-email', 'sign-up-password', 
            'sign-up-confirm-password', 'sign-up-first-name', 'sign-up-last-name', 
            'sign-up-country', 'sign-up-institution', 'sign-up-purpose'
        ];

        requiredFieldIds.forEach(id => {
            const input = document.getElementById(id);
            const value = input ? input.value : '';
            const warningLabel = document.getElementById(`${id}-blank`);

            if (!value || value.trim() === '') {
                allFilled = false;
                if (warningLabel) warningLabel.style.display = 'block';
            } else {
                if (warningLabel) warningLabel.style.display = 'none';
            }

        });

        const inputData = getSignUpFormData();
        if (inputData.confirmPassword !== inputData.password) {
            allFilled = false;
            const warningLabel = document.getElementById(`sign-up-confirm-password-notmatch`);
            if (warningLabel) warningLabel.style.display = 'block';
        } else {
            const warningLabel = document.getElementById(`sign-up-confirm-password-notmatch`);
            if (warningLabel) warningLabel.style.display = 'none';
        }

        if (!allFilled) return;

        /* 加载图标 */
        const loadingIcon = document.getElementById(`loading-icon`);
        if (loadingIcon) loadingIcon.style.display = 'block';

        const redirectUrl = `https://wuresgrp.github.io/`;
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: inputData.email,
            password: inputData.password,
            options: {
                emailRedirectTo: redirectUrl,
                data: {
                    firstName: inputData.firstName,
                    middleInitial: inputData.middleInitial,
                    lastName: inputData.lastName,
                    institution: inputData.institution,
                    leader: inputData.leader,
                    country: inputData.country,
                    purpose: inputData.purpose
                }
            }
        });

        if (signUpError) {
            alert(`Failed to sign up: ${signUpError.message}`);
            if (loadingIcon) loadingIcon.style.display = 'none';
            return;
        } else {
            alert(`The verification link has been sent to ${inputData.userEmail}, please check. `);
            window.location.href = 'https://wuresgrp.github.io/login';
        }
        
    });



});



