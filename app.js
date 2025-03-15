function updateTime() {
  const now = new Date();
  document.getElementById('time-display').textContent =
      `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ` +
      `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
}

// 图片预览处理
async function handleImageUpload(event) {
  const files = Array.from(event.target.files);
  const compressedImages = [];

  for (const file of files) {
    const reader = new FileReader();
    await new Promise(resolve => {
      reader.onload = async function (e) {
        const compressedImage = await compressImage(e.target.result);
        compressedImages.push(compressedImage);
        resolve();
      };
      reader.readAsDataURL(file);
    });
  }
  localStorage.setItem('uploadedImages', JSON.stringify(compressedImages));
}

// 新增图片压缩函数
async function compressImage(dataURL) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = (img.height * 800) / img.width;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
    img.src = dataURL;
  });
}

// 提交处理
function handleSubmit() {
  const textInput = document.getElementById('moment-input');
  const imageData = localStorage.getItem('uploadedImages');
  const images = imageData ? JSON.parse(imageData) : [];

  if (textInput.value || images.length > 0) {
    createMomentBox(textInput.value, images);
    textInput.value = '';
    localStorage.removeItem('uploadedImages');
  }
}

// 用户信息初始化
function initUser() {
  if (!localStorage.getItem('userInfo')) {
    const userId = 'user_' + Math.random().toString(36).substr(2, 9);
    const userInfo = {
      id: userId,
      nickname: '旅行者',
      avatar: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBkPSJNMTIgMkM2LjQ3OCAyIDIgNi40NzcgMiAxMnM0LjQ3OCAxMCAxMCAxMCAxMC00LjQ3NyAxMC0xMFMxNy41MjIgMiAxMiAyem0wIDEuNWM0LjcxNiAwIDguNSA04LjUgOC41IDguNXMtMy43ODQgOC41LTguNSA4LjUtOC41LTMuNzg0LTguNS04LjV6bTAgNS45NjNhMi4yIDIuMiAwIDEwMCA0LjQgMi4yIDIuMiAwIDAwMC00LjR6bS0zLjUgOWg3YTIuNzY3IDIuNzY3IDAgMDEtMi43NSAyLjVoLTEuNWExLjI1IDEuMjUgMCAwMS0xLjI1LTEuMjV2LS41YTIuNzUgMi43NSAwIDAwLTIuNS0yLjc1di0xLjV6IiBmaWxsPSIjZmZmIi8+PC9nPjwvc3ZnPg==',
      moments: []
    };
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
  }
  return JSON.parse(localStorage.getItem('userInfo'));
}

// 创建动态内容框
function createMomentBox(text, images) {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const timestamp = new Date().getTime();

  const momentData = {
    userId: user.id,
    text: text || '',
    images: images || [],
    time: new Date().toLocaleString(),
    timestamp: timestamp
  };

  // 保存到本地存储
  const moments = JSON.parse(localStorage.getItem('momentsData') || '[]');
  moments.unshift(momentData);
  localStorage.setItem('momentsData', JSON.stringify(moments));

  // 创建动态框
  const container = document.getElementById('moments-container');
  const momentDiv = document.createElement('div');
  momentDiv.className = 'moment-box';

  momentDiv.innerHTML = `
        <div class="user-info">
            <img class="user-avatar" src="${user.avatar}">
            <span class="user-nickname">${user.nickname}</span>
        </div>
        <div class="moment-content">
            ${images.map(img => `<img src="${img}" alt="上传的瞬间">`).join('')}
            <p>${text || ''}</p>
        </div>
        <div class="moment-footer">
            <span class="moment-time">${momentData.time}</span>
        </div>
    `;

  container.prepend(momentDiv);
}

// 加载存储的动态
function loadMoments() {
  const moments = JSON.parse(localStorage.getItem('momentsData') || '[]');
  const container = document.getElementById('moments-container');

  moments.forEach(moment => {
    const user = JSON.parse(localStorage.getItem('userInfo'));
    const momentDiv = document.createElement('div');
    momentDiv.className = 'moment-box';
    momentDiv.innerHTML = `
            <div class="user-info">
                <img class="user-avatar" src="${user.avatar}">
                <span class="user-nickname">${user.nickname}</span>
            </div>
            <div class="moment-content">
                ${moment.images ? moment.images.map(img => `<img src="${img}" alt="上传的瞬间">`).join('') : ''}
                <p>${moment.text}</p>
            </div>
            <div class="moment-footer">
                <span class="moment-time">${moment.time}</span>
            </div>
        `;
    container.appendChild(momentDiv);
  });
}

function openProfileEditor() {
  // 移除已存在的编辑器
  let container = document.getElementById('profile-editor-container');
  if (container) {
    container.remove();
    return;
  }

  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.id = 'profile-editor-overlay'; // 添加唯一ID
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    z-index: 999;
  `;

  // 创建容器
  container = document.createElement('div');
  container.id = 'profile-editor-container';
  container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      background: white;
      padding: 20px;
      border-radius: 8px;
      min-width: 300px;
    `;

  // 添加编辑器内容
  const user = JSON.parse(localStorage.getItem('userInfo'));
  container.innerHTML = `
      <div class="profile-editor">
        <h3>Edit Profile</h3>
        <div class="avatar-upload">
          <img src="${user.avatar}" id="preview-avatar" style="width:80px;height:80px;border-radius:50%">
          <input type="file" id="avatar-upload" accept="image/*">
        </div>
        <input type="text" id="edit-nickname" value="${user.nickname}" 
          style="display:block;width:100%;margin:10px 0;padding:8px;border-radius: 20px">
        <button onclick="saveProfile()" 
          style="background:#007bff;color:white;border:none;padding:8px 16px;border-radius:4px;cursor: pointer">
          Save
        </button>
      </div>
    `;

  // 阻止点击容器时关闭
  container.onclick = (e) => e.stopPropagation();

  // 添加元素到文档
  document.body.append(overlay, container);

  // 添加图片预览功能
  document.getElementById('avatar-upload').addEventListener('change', function (e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function (event) {
      document.getElementById('preview-avatar').src = event.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// 保存修改函数
function saveProfile() {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  const newNickname = document.getElementById('edit-nickname').value;
  const newAvatar = document.getElementById('preview-avatar').src;

  user.nickname = newNickname;
  user.avatar = newAvatar;

  localStorage.setItem('userInfo', JSON.stringify(user));

  // 移除编辑器
  const overlay = document.getElementById('profile-editor-overlay');
  const container = document.getElementById('profile-editor-container');

  if (container) container.remove();
  if (overlay) overlay.remove();

  // 重新加载动态，更新头像和昵称显示
  const momentsContainer = document.getElementById('moments-container');
  momentsContainer.innerHTML = '';
  loadMoments();

}

// 在window.onload中添加初始化和事件监听
window.onload = function () {
  initUser();
  loadMoments();
  updateTime();
  setInterval(updateTime, 1000);
  document.getElementById('image-upload').addEventListener('change', handleImageUpload);
  document.getElementById('submit-button').addEventListener('click', handleSubmit); // 假设提交按钮的id为submit-button
}