// 学习报告模块的JavaScript功能实现

// 报告类型按钮点击事件
const reportTypeBtns = document.querySelectorAll('.report-type-btn');
reportTypeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有按钮的活跃状态
        reportTypeBtns.forEach(b => {
            b.classList.remove('bg-primary-100', 'dark:bg-primary-900', 'border-primary-500');
        });
        // 添加当前按钮的活跃状态
        btn.classList.add('bg-primary-100', 'dark:bg-primary-900', 'border-primary-500');
    });
});

// 生成报告按钮点击事件
const generateReportBtn = document.getElementById('generate-report-btn');
generateReportBtn.addEventListener('click', () => {
    // 显示生成中状态
    const originalText = generateReportBtn.innerHTML;
    generateReportBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>生成中...';
    generateReportBtn.disabled = true;
    
    // 模拟生成报告的延迟
    setTimeout(() => {
        // 恢复按钮状态
        generateReportBtn.innerHTML = originalText;
        generateReportBtn.disabled = false;
        
        // 显示成功消息
        showNotification('报告生成成功！可在"我的报告"中查看', 'success');
    }, 1500);
});

// 海报选择事件
const posters = document.querySelectorAll('.achievement-poster');
let selectedPoster = null;

posters.forEach(poster => {
    poster.addEventListener('click', () => {
        // 移除所有海报的选中状态
        posters.forEach(p => {
            p.classList.remove('ring-4', 'ring-primary-500');
        });
        // 添加当前海报的选中状态
        poster.classList.add('ring-4', 'ring-primary-500');
        selectedPoster = poster;
    });
});

// 分享按钮点击事件
const shareBtn = document.getElementById('share-poster-btn');
shareBtn.addEventListener('click', () => {
    if (!selectedPoster) {
        showNotification('请先选择一个海报样式', 'warning');
        return;
    }
    
    // 显示分享中状态
    const originalText = shareBtn.innerHTML;
    shareBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>准备分享...';
    shareBtn.disabled = true;
    
    // 模拟分享的延迟
    setTimeout(() => {
        // 恢复按钮状态
        shareBtn.innerHTML = originalText;
        shareBtn.disabled = false;
        
        // 显示分享对话框
        showShareDialog();
    }, 1000);
});

// 显示通知消息
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-y-20 opacity-0 flex items-center ${type === 'success' ? 'bg-green-500 text-white' : type === 'warning' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'}`;
    
    // 设置图标
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    notification.innerHTML = `
        <i class="fas fa-${icon} mr-2"></i>
        <span>${message}</span>
    `;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示通知
    setTimeout(() => {
        notification.classList.remove('translate-y-20', 'opacity-0');
    }, 10);
    
    // 自动关闭通知
    setTimeout(() => {
        notification.classList.add('translate-y-20', 'opacity-0');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// 显示分享对话框
function showShareDialog() {
    // 创建对话框元素
    const dialog = document.createElement('div');
    dialog.className = 'fixed inset-0 flex items-center justify-center z-50';
    dialog.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" id="dialog-overlay"></div>
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 relative transform transition-all">
            <div class="p-6">
                <h3 class="text-lg font-bold mb-4">分享学习成果</h3>
                <div class="space-y-4">
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div class="flex items-center">
                            <i class="fab fa-weixin text-green-500 text-xl mr-3"></i>
                            <span>微信</span>
                        </div>
                        <button class="share-btn px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition">分享</button>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div class="flex items-center">
                            <i class="fab fa-weibo text-red-500 text-xl mr-3"></i>
                            <span>微博</span>
                        </div>
                        <button class="share-btn px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">分享</button>
                    </div>
                    <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div class="flex items-center">
                            <i class="fas fa-download text-blue-500 text-xl mr-3"></i>
                            <span>保存图片</span>
                        </div>
                        <button class="share-btn px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition">下载</button>
                    </div>
                </div>
                <div class="mt-6 flex justify-end">
                    <button id="close-dialog" class="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition">关闭</button>
                </div>
            </div>
        </div>
    `;
    
    // 添加到页面
    document.body.appendChild(dialog);
    document.body.classList.add('overflow-hidden');
    
    // 关闭对话框事件
    document.getElementById('dialog-overlay').addEventListener('click', closeDialog);
    document.getElementById('close-dialog').addEventListener('click', closeDialog);
    
    // 分享按钮点击事件
    dialog.querySelectorAll('.share-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            closeDialog();
            showNotification('分享成功！', 'success');
        });
    });
    
    function closeDialog() {
        document.body.removeChild(dialog);
        document.body.classList.remove('overflow-hidden');
    }
}