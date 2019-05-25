<template>
  <div class="site-wrapper site-page__login site-wrapper--full">
    <div class="site-content__wrapper">
      <div class="site-content">
        <div class="brand-info">
          <!-- <h2 class="brand-text">夕拾交易平台</h2>
          <p class="brand-intro">您好，欢迎使用夕拾交易平台！</p> -->
        </div>
        <div class="login-main">
          <h3 class="login-title">管理后台登录中心</h3>
          <el-form :model="dataForm" :rules="dataRule" ref="dataForm" @keyup.enter.native="dataFormSubmit()" status-icon>
            <el-form-item prop="username">
              <el-input v-model="dataForm.username" placeholder="用户名"></el-input>
            </el-form-item>
            <el-form-item prop="password">
              <el-input v-model="dataForm.password" type="password" placeholder="密码"></el-input>
            </el-form-item>
            <el-form-item prop="captcha">
              <el-row :gutter="20">
                <el-col :span="14">
                  <el-input v-model="dataForm.captcha" placeholder="验证码">
                  </el-input>
                </el-col>
                <el-col :span="10" class="login-captcha">
                  <img :src="dataForm.captchaPath" @click="getCaptcha()" alt="">
                </el-col>
              </el-row>
            </el-form-item>
            <el-form-item>
              <el-button class="login-btn-submit" type="primary" @click="dataFormSubmit()">登录</el-button>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Cookies from 'js-cookie'
export default {
  data () {
    return {
      dataForm: {
        username: '',
        password: '',
        captcha: '',
        captchaPath: ''
      },
      dataRule: {
        username: [
          { required: true, message: '必填项不能为空', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '必填项不能为空', trigger: 'blur' }
        ],
        captcha: [
          { required: true, message: '必填项不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created () {
    this.getCaptcha()
  },
  methods: {
    // 表单提交
    dataFormSubmit () {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$http.post(
            `${window.SITE_CONFIG['baseURL']}/api/sys/login`,
            {
              'username': this.dataForm.username,
              'password': this.dataForm.password,
              'captcha': this.dataForm.captcha
            }
          ).then(({data}) => {
            if (data.code === 200) {
              Cookies.set('token', data.token)
              localStorage.setItem('userId', data.userId)
              this.$message.success(data.msg)
              this.$router.replace({ name: 'home' })
            } else {
              this.getCaptcha()
              this.$message.error(data.msg)
            }
          })
        }
      })
    },
    // 获取验证码
    getCaptcha () {
      this.dataForm.captchaPath = `${window.SITE_CONFIG['baseURL']}/defaultKaptcha?date=` + new Date() * 1
    }
  }
}
</script>

<style lang="scss">
  .site-page__login {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    &::before,
    &::after {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      z-index: -1;
      content: "";
    }
    &::before {
      background-image: url(~@/assets/img/2.jpg);
      background-size: contain;
    }
    &::after {
      background-color: rgba(38, 50, 56, .6);
    }
    .site-content__wrapper {
      height: 100%;
      overflow-x: hidden;
      overflow-y: auto;
    }
    .site-content {
      position: relative;
      display: flex;
      align-items: stretch;
      min-height: 100%;
    }
    .brand-info {
      position: relative;
      flex: 1;
      display: flex;
      flex-flow: column wrap;
      justify-content: center;
      padding: 30px 130px;
      color: #fff;
    }
    .brand-text {
      margin: 0 0 22px;
      font-size: 40px;
      font-weight: 400;
      text-transform : uppercase;
    }
    .brand-intro {
      margin: 0;
      font-size: 16px;
      line-height: 1.5;
      opacity: .6;
    }
    .brand-intro + .brand-intro {
      margin-top: 6px;
    }
    .login-main {
      position: relative;
      display: flex;
      flex-flow: column wrap;
      justify-content: center;
      width: 470px;
      padding: 120px 60px;
      background-color: #fff;
    }
    .login-title {
      font-size: 16px;
    }
    .login-captcha {
      overflow: hidden;
    }
    .login-captcha > img {
      max-width: 100%;
      cursor: pointer;
    }
    .login-btn-submit {
      width: 100%;
      margin-top: 38px;
    }
    .login-copyright {
      position: absolute;
      right: 0;
      bottom: 0;
      left: 0;
      margin: 30px 20px;
      text-align: center;
    }
  }
  @media (max-width: 767px) {
    .site-page--login {
      .brand-info {
        display: none;
      }
      .login-main {
        width: 100%;
      }
      .login-title {
        text-align: center;
        font-size: 18px;
      }
      .login-captcha > img {
        width: 136px;
      }
    }
  }
  @media (max-width: 991px) {
    .site-page--login {
      .brand-info {
        padding-left: 40px;
        padding-right: 40px;
      }
    }
  }
</style>
