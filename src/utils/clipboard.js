export function copyToClipboard(text) {
    // 新标准 API（现代浏览器推荐）
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(err => {
        console.error('Async clipboard copy failed:', err);
        return false;
      });
    }
  
    // 旧版兼容方案
    return new Promise((resolve, reject) => {
      try {
        // 创建临时文本域
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';  // 避免触发滚动
        textarea.style.left = '-9999px';
        textarea.style.top = '-9999px';
        textarea.setAttribute('readonly', true);
  
        document.body.appendChild(textarea);
        
        // 兼容移动设备
        if (navigator.userAgent.match(/iphone|ipad|ipod/i)) {
          textarea.contentEditable = true;
          textarea.readOnly = true;
          const range = document.createRange();
          range.selectNodeContents(textarea);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          textarea.setSelectionRange(0, 999999);
        } else {
          textarea.select();
        }
  
        // 执行复制命令
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
  
        success ? resolve(true) : reject(new Error('Copy failed'));
      } catch (err) {
        reject(err);
      }
    }).catch(err => {
      console.error('Clipboard copy failed:', err);
      return false;
    });
  }