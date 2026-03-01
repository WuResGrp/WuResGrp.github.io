import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

document.addEventListener('DOMContentLoaded', async function() {
    await supabase.auth.signOut({ scope: 'local' });

    // ==================== 元素引用 ====================
    const loginPanel = document.getElementById('login-panel');
    const mainContainer = document.getElementById('main-container');
    const loginBtn = document.getElementById('login-btn');
    const errorMsg = document.getElementById('login-error');

    const userListHeader = document.getElementById('user-list-header');
    const userListContent = document.getElementById('user-list-content');
    const detailPanel = document.getElementById('user-detail-panel');
    const panelContent = document.getElementById('panel-content');
    const closeBtn = document.getElementById('close-panel');

    // ==================== 关闭详情面板 ====================
    closeBtn.addEventListener('click', () => {
        detailPanel.style.display = 'none';
        document.querySelectorAll('.user-row.selected').forEach(row => row.classList.remove('selected'));
    });

    // ==================== 登录按钮点击事件 ====================
    loginBtn.addEventListener('click', async () => {
        const email = document.getElementById('log-in-email').value.trim();
        const password = document.getElementById('log-in-password').value.trim();

        if (!email || !password) {
            errorMsg.textContent = 'Please enter email and password';
            return;
        }

        errorMsg.textContent = '';
        loginBtn.disabled = true;
        loginBtn.textContent = 'Logging in...';

        try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (signInError) {
                errorMsg.textContent = 'Login failed: ' + signInError.message;
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                errorMsg.textContent = 'Login failed: No access token';
                return;
            }

            // 调用 listUsers 验证是否 admin（Edge Function 会自动返回 403）
            const functionUrl = 'https://becwqxslretdluxtjfwb.supabase.co/functions/v1/admin';
            const checkResponse = await fetch(functionUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action: "listUsers" })
            });

            if (!checkResponse.ok) {
                errorMsg.textContent = 'You do not have admin permissions';
                await supabase.auth.signOut({ scope: 'local' });
                loginBtn.disabled = false;
                loginBtn.textContent = 'Login';
                return;
            }

            // 登录成功 → 切换界面
            loginPanel.style.display = 'none';
            mainContainer.style.display = 'flex';

            // 加载用户控制台
            loadAdminDashboard(session);

        } catch (err) {
            errorMsg.textContent = 'Network error, please try again';
            console.error(err);
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = 'Login';
        }
    });

    // ==================== 主控制台加载函数（包含你原来的全部代码） ====================
    async function loadAdminDashboard(session) {
        const functionUrl = 'https://becwqxslretdluxtjfwb.supabase.co/functions/v1/admin';
        
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action: "listUsers" })
        });

        const result = await response.json();

        if (!response.ok) {
            alert('Failed to load users: ' + (result.error || result.message));
            return;
        }

        let allUsers = result.data?.users || [];
        console.log("所有用户：", allUsers);

        // ==================== 你原来的常量 ====================
        const fieldIds = [
            '用户权限', '审核验证状态', '注册请求时间', 'Email*', 'First name*', 'Middle initial', 'Last name*', 
            'Country*', 'University/Institution*', 'Group leader','Purpose*',
        ];

        const metadataIds = [
            'email', 'firstName', 'middleInitial',
            'lastName', 'country', 'institution',
            'groupLeader', 'purpose', 
        ];

        const colCount = fieldIds.length;

        // ==================== 你原来的辅助函数（完全保留） ====================
        async function performAdminAction(actionType, user) {
            const functionUrl = 'https://becwqxslretdluxtjfwb.supabase.co/functions/v1/admin';
            
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                alert('Login expired, please login again');
                return false;
            }

            let bodyAction = '';
            let bodyPayload = {};

            if (actionType === 'sendEmail') {
                bodyAction = 'sendVerificationEmail';
                bodyPayload = { userId: user.id };
            } else if (actionType === 'deleteUser') {
                bodyAction = 'deleteUser';
                bodyPayload = { userId: user.id };
            }

            try {
                const response = await fetch(functionUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        action: bodyAction, 
                        payload: bodyPayload 
                    })
                });

                const result = await response.json();

                if (!response.ok) {
                    alert(`Operation failed: ${result.error || result.message || 'Unknown error'}`);
                    return false;
                }

                if (actionType === 'sendEmail') {
                    alert(`Verification email sent to ${user.email || user.user_metadata?.email || user.id}, and set as reviewed`);
                } else {
                    alert(`User ${user.email || user.id} has been permanently deleted`);
                }

                // 刷新列表
                if (typeof window.loadUsers === 'function') {
                    window.loadUsers();
                } else {
                    location.reload();
                }
                return true;
            } catch (err) {
                console.error(err);
                alert('Network error, please try again');
                return false;
            }
        }

        function showConfirmModal(action, user) {
            const overlay = document.createElement('div');
            overlay.className = 'modal-overlay';

            let actionText = action === 'sendEmail' ? 'Send Verification Email' : 'Delete User';
            let confirmText = action === 'sendEmail' 
                ? `确定要向 ${user.email || user.user_metadata?.email || user.id}发送验证邮件吗？<br><small>（同时自动设置为已审核）</small>`
                : `确定要永久删除用户 ${user.email || user.id}吗？此操作不可撤销。`;

            overlay.innerHTML = `
                <div class="modal-card">
                <h3>${actionText}</h3>
                <p>${confirmText}</p>
                <div class="modal-actions">
                    <button class="cancel-btn">取消</button>
                    <button class="confirm-btn">确认</button>
                </div>
                </div>
            `;

            document.body.appendChild(overlay);

            const cancelBtn = overlay.querySelector('.cancel-btn');
            const confirmBtn = overlay.querySelector('.confirm-btn');

            const closeModal = () => document.body.removeChild(overlay);

            cancelBtn.addEventListener('click', closeModal);

            confirmBtn.addEventListener('click', async () => {
                confirmBtn.disabled = true;
                confirmBtn.textContent = 'Processing...';

                await performAdminAction(action, user);
                closeModal();
            });

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal();
            });
        }

        function showUserDetail(user) {
            const metadata = user.user_metadata || {};
            const metadataLabels = fieldIds.slice(3);

            let permission = '';
            if (!user.role) {
                permission = '普通用户 (未审核)';
            } else if (user.role === 'user') {
                permission = '普通用户';
            } else if (user.role === 'admin') {
                permission = '管理账户';
            }

            let verificationStatus = '';
            const emailVerified = metadata.email_verified;
            if (emailVerified === true) {
                verificationStatus = '已审核, 用户已验证';
            } else {
                verificationStatus = (user.role === 'user') ? '已审核, 用户未验证' : '未审核';
            }

            let html = '';
            html += `<p><strong>用户权限:</strong> ${permission}</p>`;
            html += `<p><strong>审核与验证状态:</strong> ${verificationStatus}</p>`;
            html += `<p><strong>申请时间:</strong> ${user.created_at ? new Date(user.created_at).toLocaleString() : ' '}</p>`;
            html += `<hr>`;

            metadataIds.forEach((metadataId, index) => {
                const label = metadataLabels[index];
                const value = metadata[metadataId];
                html += `<p><strong>${label}:</strong> ${value || '—'}</p>`;
            });
            html += `<hr>`;

            html += `<div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">`;
            if (verificationStatus !== '已审核, 用户已验证' && user.role !== 'admin') {
                html += `<button id="send-email-btn" class="action-btn send-email-btn">发送验证邮件</button>`;
            }
            if (user.role !== 'admin') {
                html += `<button id="delete-user-btn" class="action-btn delete-btn">删除该用户</button>`;
            }
            html += `</div>`;

            panelContent.innerHTML = html;
            detailPanel.style.display = 'flex';

            const sendBtn = document.getElementById('send-email-btn');
            if (sendBtn) sendBtn.addEventListener('click', () => showConfirmModal('sendEmail', user));

            const deleteBtn = document.getElementById('delete-user-btn');
            if (deleteBtn) deleteBtn.addEventListener('click', () => showConfirmModal('deleteUser', user));
        }

        function renderTable(users) {
            userListHeader.innerHTML = '';
            userListContent.innerHTML = '';

            fieldIds.forEach(key => {
                const headerCell = document.createElement('div');
                headerCell.className = 'user-list-header-items';
                headerCell.textContent = key;
                userListHeader.appendChild(headerCell);
            });

            userListHeader.style.gridTemplateColumns = `repeat(${colCount}, minmax(130px, 1fr))`;

            users.forEach(user => {
                const row = document.createElement('div');
                row.className = 'user-row';
                row.style.gridTemplateColumns = `repeat(${colCount}, minmax(130px, 1fr))`;

                // 权限列
                let permission = !user.role ? '普通用户 (未审核)' : (user.role === 'user' ? '普通用户' : '管理账户');
                const cell1 = document.createElement('div');
                cell1.className = 'user-list-content-items';
                cell1.textContent = permission;
                row.appendChild(cell1);

                // 审核状态列
                const cell2 = document.createElement('div');
                cell2.className = 'user-list-content-items';
                const ev = user.user_metadata?.['email_verified'];
                cell2.textContent = (ev === true) ? '已审核, 用户已验证' : (user.role === 'user' ? '已审核, 用户未验证' : '未审核');
                row.appendChild(cell2);

                // 注册时间列
                const cell3 = document.createElement('div');
                cell3.className = 'user-list-content-items';
                cell3.textContent = user.created_at ? new Date(user.created_at).toLocaleString() : '';
                row.appendChild(cell3);

                // metadata 列
                metadataIds.forEach(metadataId => {
                    const cell = document.createElement('div');
                    cell.className = 'user-list-content-items';
                    cell.textContent = user.user_metadata?.[metadataId] ?? '';
                    row.appendChild(cell);
                });

                row.addEventListener('click', () => {
                    document.querySelectorAll('.user-row.selected').forEach(r => r.classList.remove('selected'));
                    row.classList.add('selected');
                    showUserDetail(user);
                });

                userListContent.appendChild(row);
            });
        }

        function filterUsers(filterValue) {
            switch (filterValue) {
                case 'all':
                    return allUsers;
                case 'reviewed_verified':
                    return allUsers.filter(user => user.user_metadata?.['email_verified'] === true);
                case 'reviewed_unverified':
                    return allUsers.filter(user => user.user_metadata?.['email_verified'] === false && user.role === 'user');
                case 'unreviewed_unverified':
                    return allUsers.filter(user => user.user_metadata?.['email_verified'] === false && user.role === '');
                default:
                    return allUsers;
            }
        }

        // ==================== 首次渲染 ====================
        renderTable(allUsers);

        const loadingIcon = document.getElementById('loading-icon');
        if (loadingIcon) loadingIcon.style.display = 'none';

        // 筛选器
        document.getElementById('filterSelect').addEventListener('change', function(e) {
            const filtered = filterUsers(e.target.value);
            renderTable(filtered);
        });

        // 暴露给全局（刷新时用）
        window.loadUsers = () => loadAdminDashboard(session);
    }
});

