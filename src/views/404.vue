<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
// 404 页面组件
</script>

<template>
  <el-result icon="info" title="404" sub-title="页面未找到">
    <template #extra>
      <el-button type="primary" @click="$router.replace('/login')">返回登录</el-button>
    </template>
  </el-result>
</template>
