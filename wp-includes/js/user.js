
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
/* WuResGrp's Project */
const supabase = createClient(
	'https://becwqxslretdluxtjfwb.supabase.co', 
	'sb_publishable_4vbRXO-L2_RCSbJI6Sxweg_WhuckUgD'
);

document.addEventListener('DOMContentLoaded', async function() {

    /* 检查登录状态 */
    const { data: { session } } = await supabase.auth.getSession();
    console.log(session);

    const user = session?.user;
    if (user) {
        
        let userMenu = document.getElementById('user-menu-header-div');
        
        if (!userMenu) return;
        
        const names = [
			user.user_metadata.firstName,
			user.user_metadata.middleInitial,
			user.user_metadata.lastName
		].filter(Boolean);
        
        userMenu.innerHTML = `
            <div id='user-menu-header-trigger'>
                <p>${names.join(' ')}<span class="arrow">▼</span></p>
            </div>
            <div id='user-menu-header-content' style="display: none;">
                <p>Email: ${user.user_metadata.email}</p>
                <button id="sign-out-btn-header">Sign Out</button>
            </div>
        `;

        const userMenuHeaderTrigger = document.getElementById('user-menu-header-trigger');
        const userMenuContent = document.getElementById('user-menu-header-content');

        userMenuHeaderTrigger.addEventListener('click', function(e) {
            // 切换菜单显示
            if (userMenuContent.style.display === 'none' || userMenuContent.style.display === '') {
                userMenuContent.style.display = 'block';
                userMenuHeaderTrigger.classList.add('dropdown-open');   // 添加旋转类
            } else {
                userMenuContent.style.display = 'none';
                userMenuHeaderTrigger.classList.remove('dropdown-open'); // 移除旋转类
            }
        });

        // 全局点击关闭
        document.addEventListener('click', function(e) {
            // 处理桌面版浮窗
            if (userMenuContent.style.display === 'block') {
                // 如果点击不在触发器且不在浮窗内，则关闭
                if (!userMenuHeaderTrigger.contains(e.target) && !userMenuContent.contains(e.target)) {
                    userMenuContent.style.display = 'none';
                    userMenuHeaderTrigger.classList.remove('dropdown-open');
                }
            }
        });
    
        // 退出登录
        const signOutBtn = document.getElementById('sign-out-btn-header');
        signOutBtn.addEventListener('click', async () => {

            await supabase.auth.signOut({ scope: 'local' });
            location.reload();
        });
        

    }

});