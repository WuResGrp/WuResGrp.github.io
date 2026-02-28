import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

document.addEventListener('DOMContentLoaded', async function() {
    await supabase.auth.signOut({ scope: 'local' });
    // 1. 登录
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'y30240461@mail.ecust.edu.cn',
        password: 'a961164866'
    });
//  
    if (signInError) {
        console.error('登录失败:', signInError.message);
        return;
    }
// 
    const { data: { session } } = await supabase.auth.getSession();
    console.log('当前会话:', session);
//  
    if (!session?.access_token) {
        console.error('没有 access_token, 无法调用');
        return;
    }
// 
    // ========== 原生 fetch 调用 ==========
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
        console.error('函数返回错误:', result);
        console.error('HTTP 状态码:', response.status);
    } else {
        console.log("所有用户：", result.data?.users); 
    }

    const allUsers = result.data?.users;
    const userListHeader = document.getElementById('user-list-header');
    const userListContent = document.getElementById('user-list-content');
    const detailPanel = document.getElementById('user-detail-panel');
    const panelContent = document.getElementById('panel-content');
    const closeBtn = document.getElementById('close-panel');


    const fieldIds = [
        '用户权限', '审核验证状态', '注册请求时间', 'Email*', 'First name*', 'Middle initial', 'Last name*', 
        'Country*', 'University/Institution*', 'Group leader','Purpose*',
    ];

    const metadataIds = [
        'email', 'firstName', 'middleInitial',
        'lastName', 'country', 'institution',
        'groupLeader', 'purpose', 
    ]

    // 关闭面板
    closeBtn.addEventListener('click', () => {
        detailPanel.style.display = 'none';
        // 移除所有行的选中样式（可选）
        document.querySelectorAll('.user-row.selected').forEach(row => row.classList.remove('selected'));
    });

    // ==================== 辅助函数（放在你的 JS 文件任意位置） ====================
    async function performAdminAction(actionType, user) {
        const functionUrl = 'https://becwqxslretdluxtjfwb.supabase.co/functions/v1/admin';
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) {
            alert('登录已失效，请重新登录');
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
                alert(`操作失败: ${result.error || result.message || '未知错误'}`);
                return false;
            }

            // 成功提示
            if (actionType === 'sendEmail') {
                alert(`验证邮件已发送给 ${user.email || user.user_metadata?.email || user.id}，并设置为已审核`);
            } else {
                alert(`用户 ${user.email || user.id} 已永久删除`);
            }

            // 操作成功后自动刷新用户列表（把你的加载函数改成 window.loadUsers 即可）
            if (typeof window.loadUsers === 'function') {
                window.loadUsers();
            } else {
                location.reload();   // 临时方案：直接刷新页面
            }

            return true;
        } catch (err) {
            console.error(err);
            alert('网络错误，请稍后重试');
            return false;
        }
    }

    // ==================== 修改后的 showConfirmModal（完整替换原来的） ====================
    function showConfirmModal(action, user) {
        const overlay = document.createElement('div');
        overlay.className = 'modal-overlay';

        let actionText = action === 'sendEmail' ? '发送验证邮件' : '删除用户';
        let confirmText = action === 'sendEmail' 
            ? `确定要向 ${user.email || user.user_metadata?.email || user.id} 发送验证邮件吗？<br><small>（同时自动设置为已审核）</small>`
            : `确定要永久删除用户 ${user.email || user.id} 吗？此操作不可撤销。`;

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
            confirmBtn.textContent = '处理中...';

            const success = await performAdminAction(action, user);
            
            closeModal();   // 无论成功失败都关闭弹窗（失败已在 performAdminAction 中 alert）
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeModal();
        });
    }

    // 更新面板内容并显示
    function showUserDetail(user) {
        const metadata = user.user_metadata || {};
        const metadataLabels = fieldIds.slice(3); // 获取 metadata 部分的表头标签

        let permission = '';
        if (!user.role) {
            permission = '普通用户 (未审核)';
        } else {
            if (user.role === 'user') {
                permission = '普通用户';
            } else if (user.role === 'admin') {
                permission = '管理员账户';
            }

        }

        let verificationStatus = '';
        const emailVerified = metadata.email_verified;
        if (emailVerified === true) {
            verificationStatus = '已审核，用户已验证';
        } else {
            verificationStatus = (user.role === 'user') ? '已审核，用户未验证' : '未审核';
        }

        let html = '';
        html += `<p><strong>用户权限:</strong> ${permission}</p>`;
        html += `<p><strong>审核验证状态:</strong> ${verificationStatus}</p>`;
        html += `<p><strong>注册请求时间:</strong> ${user.created_at ? new Date(user.created_at).toLocaleString() : ' '}</p>`;
        html += `<hr>`;

        metadataIds.forEach((metadataId, index) => {
            const label = metadataLabels[index];
            const value = metadata[metadataId];
            html += `<p><strong>${label}:</strong> ${value || '—'}</p>`;
        });
        html += `<hr>`;

        // 添加按钮区域
        html += `<div style="margin-top: 20px; display: flex; gap: 10px; justify-content: flex-end;">`;
        if (verificationStatus !== '已审核，用户已验证' && user.role !== 'admin') {
            html += `<button id="send-email-btn" class="action-btn send-email-btn">发送验证邮件</button>`;
        }
        if (user.role !== 'admin') {
            html += `<button id="delete-user-btn" class="action-btn delete-btn">删除该用户</button>`;
        }
        html += `</div>`;

        // 一次性设置内容并显示面板
        panelContent.innerHTML = html;
        detailPanel.style.display = 'flex';

        // 绑定按钮事件（必须放在 innerHTML 设置之后）
        const sendBtn = document.getElementById('send-email-btn');
        if (sendBtn) {
            sendBtn.addEventListener('click', () => {
                showConfirmModal('sendEmail', user);
            });
        }
        const deleteBtn = document.getElementById('delete-user-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                showConfirmModal('deleteUser', user);
            });
        }
    }

    // 设置列数
    const colCount = fieldIds.length;

    function renderTable(users) {

        // 清空容器
        userListHeader.innerHTML = '';
        userListContent.innerHTML = '';

        // 渲染表头
        fieldIds.forEach(key => {
            const headerCell = document.createElement('div');
            headerCell.className = 'user-list-header-items';
            headerCell.textContent = key;
            userListHeader.appendChild(headerCell);
        });

        // 设置表头网格列数
        userListHeader.style.gridTemplateColumns = `repeat(${colCount}, minmax(130px, 1fr))`;

        // 渲染数据行
        users.forEach(user => {
            const row = document.createElement('div');
            row.className = 'user-row';
            // 设置该行网格列数
            row.style.gridTemplateColumns = `repeat(${colCount}, minmax(130px, 1fr))`;

            // 单元格：用户权限
            let permission = '';
                if (!user.role) {
                    permission = '普通用户 (未审核)';
                } else {
                    if (user.role === 'user') {
                        permission = '普通用户';
                    } else if (user.role === 'admin') {
                        permission = '管理员账户';
                    }

                }
            
            const cell1 = document.createElement('div');
            cell1.className = 'user-list-content-items';
            cell1.textContent = permission;
            row.appendChild(cell1);

            // 单元格：审核验证状态
            const cell2 = document.createElement('div');
            cell2.className = 'user-list-content-items';
            cell2.textContent = user.user_metadata?.['email_verified'] ?? '';
            if (cell2.textContent === 'true') cell2.textContent = '已审核，用户已验证'
            else {
                if (user.role === 'user') cell2.textContent = '已审核，用户未验证'
                else cell2.textContent = '未审核'
            }
            row.appendChild(cell2);

            // 单元格：注册请求时间
            const cell3 = document.createElement('div');
            cell3.className = 'user-list-content-items';
            cell3.textContent = user.created_at ?? '';
            row.appendChild(cell3);

            // metadata 单元格
            metadataIds.forEach(metadataId => {
                const cell = document.createElement('div');
                cell.className = 'user-list-content-items';
                cell.textContent = user.user_metadata?.[metadataId] ?? '';
                row.appendChild(cell);
            });

            // 点击行显示详情
            row.addEventListener('click', (e) => {
                // 移除其他行的选中样式
                document.querySelectorAll('.user-row.selected').forEach(r => r.classList.remove('selected'));
                row.classList.add('selected');
                showUserDetail(user);
            });

            userListContent.appendChild(row);
        });
    }

    // 筛选函数（根据筛选值过滤用户）
    function filterUsers(filterValue) {
        switch (filterValue) {
            case 'all':
                return allUsers;  // 全部用户
            case 'reviewed_verified':
                // 已审核，用户已验证
                return allUsers.filter(user => {
                    /* 已审核，用户已验证条件 */
                    if (user.user_metadata?.['email_verified'] === true) return true;
                    return false;
                });
            case 'reviewed_unverified':
                // 已审核，用户未验证
                return allUsers.filter(user => {
                    /* 已审核，用户未验证条件 */
                    if ((user.user_metadata?.['email_verified'] === false) && user.role === 'user') {
                        return true;
                    }
                    return false;
                });
            case 'unreviewed_unverified':
                // 未审核
                return allUsers.filter(user => {
                    console.log(user.user_metadata?.['email_verified']);
                    console.log(user.role);
                    /* 未审核条件 */
                    if ((user.user_metadata?.['email_verified'] === false) && user.role === '') {
                        return true;
                    }
                    return false; 
                });
            default:
                return allUsers;
        }
    }

    renderTable(allUsers);

    const loadingIcon = document.getElementById(`loading-icon`);
    if (loadingIcon) loadingIcon.style.display = 'none';

    // 监听筛选框变化
    document.getElementById('filterSelect').addEventListener('change', function(e) {

        const filtered = filterUsers(e.target.value);
        renderTable(filtered);

    });


    // await supabase.auth.signOut({ scope: 'local' });
});

