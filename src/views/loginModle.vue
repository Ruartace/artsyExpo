<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
// import { useMediaQuery } from '@vueuse/core'
// import { ElMessage } from 'element-plus'
import { Service, Phone, Message } from '@element-plus/icons-vue'

// const isLargeScreen = useMediaQuery('(min-width: 2560px)')
const router = useRouter()

// 使用封装的认证组合式函数
const { loading, loginForm, login, currentUser } = useAuth()
const errorMessage = ref('')
const forgotPwdDialogVisible = ref(false)
const rememberMe = ref(false)

// 处理登录
const handleLogin = async () => {
  const success = await login(loginForm, rememberMe.value)
  if (success) {
    const role = currentUser.value.role

    if (role === 'admin') {
      router.push('/admin')
    } else if (role === 'approval') {
      router.push('/approval')
    } else if (role === 'logaudit') {
      router.push('/logaudit')
    } else {
      router.push('/user/home')
    }
  }
}

// 忘记密码
const handleForgotPwd = () => {
  forgotPwdDialogVisible.value = true
}

console.log('LoginModle mounted')
</script>

<template>
  <div class="login-root">
    <div class="box-root flex-flex flex-direction--column" style="min-height: 100vh; flex-grow: 1">
      <div class="loginbackground padding-top--64">
        <div class="loginbackground-gridContainer">
          <div class="box-root flex-flex" style="grid-area: top / start / 8 / end">
            <div
              class="box-root"
              style="
                background-image:
                  linear-gradient(rgba(255, 255, 255, 0) 0%, rgb(247, 250, 252) 33%),
                  url('/photos/mmexport1766200643684.jpg');
                background-size: cover;
                background-position: center;
                flex-grow: 1;
              "
            ></div>
          </div>
          <div class="box-root flex-flex" style="grid-area: 4 / 2 / auto / 5">
            <!-- <div class="box-root box-divider--light-all-2" style="flex-grow: 1"></div> -->
          </div>
          <div class="box-root flex-flex" style="grid-area: 6 / start / auto / 2">
            <div class="box-root box-background--blue800" style="flex-grow: 1"></div>
          </div>
          <div class="box-root flex-flex" style="grid-area: 7 / start / auto / 6">
            <div class="box-root box-background--blue" style="flex-grow: 1"></div>
          </div>
          <div class="box-root flex-flex" style="grid-area: 8 / 4 / auto / 9">
            <div class="box-root box-background--gray100" style="flex-grow: 1"></div>
          </div>
          <div class="box-root flex-flex" style="grid-area: 2 / 18 / auto / end">
            <div class="box-root box-background--cyan200" style="flex-grow: 1"></div>
          </div>
          <div class="box-root flex-flex" style="grid-area: 3 / 18 / auto / end">
            <div class="box-root box-background--blue" style="flex-grow: 1"></div>
          </div>
          <div class="box-root flex-flex" style="grid-area: 4 / 14 / auto / 20">
            <div class="box-root box-background--gray100" style="flex-grow: 1"></div>
          </div>
          <div class="box-root flex-flex" style="grid-area: 5 / 14 / auto / 17">
            <!-- <div class="box-root box-divider--light-all-2" style="flex-grow: 1"></div> -->
          </div>
        </div>
      </div>
      <div
        class="box-root padding-top--24 flex-flex flex-direction--column"
        style="flex-grow: 1; z-index: 9; justify-content: center"
      >
        <div class="formbg-outer">
          <div class="formbg">
            <div class="formbg-inner padding-horizontal--48">
              <div class="system-title-container">
                <h1 class="system-title">中艺展报名系统</h1>
              </div>
              <div class="login-header">
                <h2 class="login-title">欢迎登录中艺展报名系统</h2>
              </div>

              <el-alert
                v-if="errorMessage"
                :title="errorMessage"
                type="error"
                show-icon
                :closable="false"
                class="login-alert"
              />

              <el-form
                :model="loginForm"
                @submit.prevent="handleLogin"
                label-position="top"
                size="large"
                class="login-form"
              >
                <el-form-item class="form-item-spacing">
                  <template #label>
                    <div class="password-label-row">
                      <span>账号</span>
                    </div>
                  </template>
                  <el-input v-model="loginForm.account" placeholder="请输入账号" />
                </el-form-item>

                <el-form-item class="form-item-spacing">
                  <template #label>
                    <div class="password-label-row">
                      <span>密码</span>
                      <el-link
                        type="primary"
                        :underline="false"
                        @click="handleForgotPwd"
                        class="forgot-pwd-link"
                        >忘记密码？</el-link
                      >
                    </div>
                  </template>
                  <el-input
                    v-model="loginForm.password"
                    type="password"
                    placeholder="请输入密码"
                    show-password
                  />
                </el-form-item>

                <el-form-item class="checkbox-item">
                  <el-checkbox v-model="rememberMe">保留一周登录记录</el-checkbox>
                </el-form-item>

                <el-form-item class="submit-item">
                  <el-button
                    type="primary"
                    :loading="loading"
                    class="submit-btn"
                    @click="handleLogin"
                  >
                    {{ loading ? '登录中...' : '登录' }}
                  </el-button>
                </el-form-item>

                <div class="info-text">
                  本次系统开放时间：<br />2025年12月19日00:00-2025年12月31日24:00。<br />
                  请合理安排填报时间。
                </div>
              </el-form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <el-dialog
    v-model="forgotPwdDialogVisible"
    title="联系管理员"
    width="400px"
    align-center
    class="custom-dialog"
    :show-close="false"
  >
    <div class="contact-info">
      <div class="info-icon">
        <el-icon :size="48" color="#d32f2f"><Service /></el-icon>
      </div>
      <p class="info-desc">如需重置密码或获取账号，请联系系统管理员</p>
      <div class="info-detail">
        <div class="detail-item">
          <el-icon><Phone /></el-icon>
          <span>010-12345678</span>
        </div>
        <div class="detail-item">
          <el-icon><Message /></el-icon>
          <span>admin@artsyexpo.com</span>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button type="primary" @click="forgotPwdDialogVisible = false" class="dialog-btn">
          知道了
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
* {
  padding: 0;
  margin: 0;
  color: #1a1f36;
  box-sizing: border-box;
  font-family:
    -apple-system,
    BlinkMacSystemFont,
    Segoe UI,
    Roboto,
    Helvetica Neue,
    Ubuntu,
    sans-serif;
  font-weight: 500;
}
body {
  min-height: 100%;
  background-color: #ffffff;
}
h1 {
  letter-spacing: -1px;
}
a {
  color: #5469d4;
  text-decoration: unset;
}
.login-root {
  background: #fff url('/photos/mmexport1766200643684.jpg') no-repeat center center fixed;
  background-size: cover;
  display: flex;
  width: 100%;
  min-height: 100vh;
  overflow: hidden;
  position: relative;
  .loginbackground {
    min-height: 692px;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    z-index: 0;
    overflow: hidden;
  }
  .loginbackground-gridContainer {
    display: grid;
    grid-template-columns: [start] 1fr [left-gutter] repeat(16, 86.6px) [left-gutter] 1fr [end];
    grid-template-rows: [top] 1fr [top-gutter] repeat(8, 64px) [bottom-gutter] 1fr [bottom];
    justify-content: center;
    margin: 0 -2%;
    transform: rotate(-12deg) skew(-12deg);
    position: relative;
    z-index: 2;
  }
}

/* Overlay to darken the background image/theme */
.loginbackground::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  z-index: 1;
}

.flex-flex {
  display: flex;
}
.align-center {
  align-items: center;
}
.center-center {
  align-items: center;
  justify-content: center;
}
.box-root {
  box-sizing: border-box;
}
.flex-direction--column {
  -ms-flex-direction: column;
  flex-direction: column;
}
.box-divider--light-all-2 {
  box-shadow: inset 0 0 0 2px #e3e8ee;
}
.box-background--white {
  background-color: #ffffff;
}
/* Image Background Styles applied to grid items */
.box-background--blue800 {
  background-image: url('/photos/mmexport1766200643684.jpg') !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  filter: contrast(1.4) brightness(0.8) saturate(1.2); /* Deep, rich red */
}
.box-background--blue {
  background-image: url('/photos/mmexport1766200643684.jpg') !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  filter: contrast(1.1) brightness(1.1) saturate(1.1); /* Vibrant red */
}
.box-background--cyan200 {
  background-image: url('/photos/mmexport1766200643684.jpg') !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  filter: contrast(1) brightness(1.3) sepia(0.3) saturate(0.8); /* Lighter, pinkish */
}
.box-background--gray100 {
  background-image: url('/photos/mmexport1766200643684.jpg') !important;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  filter: grayscale(0.4) contrast(1.1) brightness(1.2); /* Muted, texture */
}
.padding-top--64 {
  padding-top: 64px;
}
.padding-top--24 {
  padding-top: 24px;
}
.padding-top--48 {
  padding-top: 48px;
}
.padding-bottom--24 {
  padding-bottom: 24px;
}
.padding-horizontal--48 {
  padding: 48px;
}
.padding-bottom--15 {
  padding-bottom: 15px;
}

.flex-justifyContent--center {
  -ms-flex-pack: center;
  justify-content: center;
}

/* iOS Glassmorphism Card */
.formbg {
  margin: 0px auto;
  width: 90%;
  max-width: 448px;
  background: #ffffff;
  border-radius: 24px; /* More rounded */
  box-shadow:
    0 8px 32px 0 rgba(0, 0, 0, 0.2),
    0 1px 2px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}
@media (min-width: 1920px) {
  .formbg {
    max-width: 500px;
  }
}
@media (min-width: 2560px) {
  .formbg {
    max-width: 600px;
    padding: 20px;
  }
  span {
    font-size: 24px;
  }
}
@media (max-width: 480px) {
  .formbg-inner {
    padding: 24px;
  }
}
span {
  display: block;
  font-size: 20px;
  line-height: 28px;
  color: #1a1f36;
}
label {
  margin-bottom: 10px;
}
.reset-pass a,
label {
  font-size: 14px;
  font-weight: 600;
  display: block;
}
.reset-pass > a {
  text-align: right;
  margin-bottom: 10px;
}
.grid--50-50 {
  display: grid;
  grid-template-columns: 50% 50%;
  align-items: center;
}

a.ssolink {
  display: block;
  text-align: center;
  font-weight: 600;
}
.footer-link {
  margin-top: 24px;
  text-align: center;
}
.footer-link span {
  font-size: 14px;
  color: #697386;
}
.contact-link {
  vertical-align: baseline;
}
.listing a {
  color: #697386;
  font-weight: 600;
  margin: 0 10px;
}

.animationRightLeft {
  animation: animationRightLeft 2s ease-in-out infinite;
}
.animationLeftRight {
  animation: animationLeftRight 2s ease-in-out infinite;
}
.tans3s {
  animation: animationLeftRight 3s ease-in-out infinite;
}
.tans4s {
  animation: animationLeftRight 4s ease-in-out infinite;
}

@keyframes animationLeftRight {
  0% {
    transform: translateX(0px);
  }
  50% {
    transform: translateX(1000px);
  }
  100% {
    transform: translateX(0px);
  }
}

@keyframes animationRightLeft {
  0% {
    transform: translateX(0px);
  }
  50% {
    transform: translateX(-1000px);
  }
  100% {
    transform: translateX(0px);
  }
}

.contact-info p {
  margin-bottom: 10px;
  font-size: 16px;
}

/* Custom UI Refinements for iOS feel */
.login-form :deep(.el-form-item__label) {
  width: 100%;
  padding-right: 0;
  color: #1a1f36;
}

.login-form :deep(.el-input__inner) {
  font-size: 16px;
  height: 48px;
}

.login-form :deep(.el-input__wrapper) {
  padding: 1px 15px;
}

.form-item-spacing {
  margin-bottom: 24px;
}

.login-header {
  margin-bottom: 30px;
  text-align: center;
}
.login-title {
  font-size: 22px;
  color: #1a1f36;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.5px;
}
.login-alert {
  margin-bottom: 20px;
  border-radius: 12px;
}
.password-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.password-label-row span {
  font-size: 16px;
  font-weight: 600;
  color: #1a1f36;
}
.forgot-pwd-link {
  font-size: 15px;
  color: #d32f2f;
}
.checkbox-item {
  margin-bottom: 20px;
}
.submit-btn {
  width: 100%;
  font-weight: 600;
  height: 44px;
  font-size: 16px;
  color: #fff;
  background-color: #d32f2f;
  border-color: #d32f2f;
}
.submit-btn:hover,
.submit-btn:focus {
  background-color: #b71c1c;
  border-color: #b71c1c;
}

.info-text {
  margin-top: 24px;
  text-align: start;
  font-size: 16px;
  color: #d32f2f;
  font-weight: 600;
  display: inline-block;
  width: 100%;
}

.system-title-container {
  text-align: center;
  margin-bottom: 10px;
}

.system-title {
  font-size: 2.2rem;
  color: #d32f2f;
  font-weight: bold;
  display: inline-block;
}

/* Dialog Styles */
:deep(.custom-dialog) {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}
:deep(.custom-dialog .el-dialog__header) {
  margin: 0;
  padding: 24px 24px 0;
  text-align: center;
}
:deep(.custom-dialog .el-dialog__title) {
  font-size: 18px;
  font-weight: 600;
  color: #1a1f36;
}
:deep(.custom-dialog .el-dialog__body) {
  padding: 24px;
}
:deep(.custom-dialog .el-dialog__footer) {
  padding: 0 24px 24px;
  text-align: center;
}
.contact-info {
  text-align: center;
}
.info-icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}
.info-icon .el-icon {
  color: #d32f2f;
}
.info-desc {
  margin-bottom: 24px;
  font-size: 14px;
  color: #697386;
  line-height: 1.5;
}
.info-detail {
  background-color: #f7fafc;
  border-radius: 8px;
  padding: 16px;
}
.detail-item {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  color: #1a1f36;
  font-size: 15px;
  font-weight: 500;
}
.detail-item:last-child {
  margin-bottom: 0;
}
.detail-item .el-icon {
  margin-right: 8px;
  color: #d32f2f;
  font-size: 18px;
}
.dialog-btn {
  width: 100%;
  height: 40px;
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  background-color: #d32f2f;
  border: none;
  border-radius: 4px;
}
.dialog-btn:hover {
  background-color: #b71c1c;
}
</style>
