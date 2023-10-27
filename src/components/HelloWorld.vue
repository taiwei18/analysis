<template>
  <h1>Excel导入解析</h1>
  <a-card title="导入表格格式" class="ma">
    <p>表格仅供展示校对</p>
    <p>关键词和敏感词必须/分割</p>
    <p>表头依次设置为product_name，keywords，sensitive_words，answer</p>
  </a-card>
  <div class="ma">
    <a-input-search v-model:value="searchValue" placeholder="input search text" disabled style="width: 200px"
      @search="onSearch" />
    <input type="file" @change="handleFileUpload" />
    <a-upload v-model:file-list="fileList" name="file" action="http://localhost:3000/api/upload" :headers="headers"
      @change="handleChange">
      <a-button style="margin: 20px 0;">
        <upload-outlined></upload-outlined>
        Click to Upload
      </a-button>
    </a-upload>
  </div>
  <a-table :dataSource="dataSource" :columns="columns">
    <template #bodyCell="{ record, column }">
      <template v-if="column.key === 'column'">
        <a-tag :bordered="false" color="processing" style="cursor: pointer;" @Click="showModal(record)">修改</a-tag>
      </template>
    </template>

  </a-table>
  <a-modal v-model:open="open" title="修改" style="width:50vw;" centered>
    <a-form :model="formState" name="basic" autocomplete="off" @finishFailed="onFinishFailed" layout="vertical">
      <a-form-item label="产品" name="product_name">
        <a-input v-model:value="formState.product_name" />
      </a-form-item>

      <a-form-item label="关键词" name="keywords">
        <a-input v-model:value="formState.keywords" />
      </a-form-item>

      <a-form-item label="敏感词" name="sensitive_words">
        <a-input v-model:value="formState.sensitive_words" />
      </a-form-item>

      <a-form-item label="答案" name="answer">
        <a-textarea v-model:value="formState.answer" placeholder="answer" :rows="6" />
      </a-form-item>

    </a-form>
    <template #footer>
      <a-button type="primary" @Click="handleOk">确定</a-button>
    </template>
  </a-modal>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue'
import requestData from '../api/request'
import product_api from '../api/index'
import { message, notification } from 'ant-design-vue';
import { UploadOutlined, SmileOutlined } from '@ant-design/icons-vue';
import type { UploadChangeParam } from 'ant-design-vue';
interface FormState {
  id: number;
  product_name: string;
  keywords: string;
  sensitive_words: string;
  answer: string;
}
let searchValue = ref('')
const selectedFile = ref(null)
const fileList = ref([]);
let dataSource = ref([])
const open = ref<boolean>(false);
const columns = reactive([
  {
    title: '产品',
    dataIndex: 'product_name',
    key: 'product_name',
    width: 90,
  },
  {
    title: '关键词',
    dataIndex: 'keywords',
    key: 'keywords',
    ellipsis: true,
    width: 300,
  },
  {
    title: '敏感词',
    dataIndex: 'sensitive_words',
    key: 'sensitive_words',
    ellipsis: true,
    width: 200,
  },
  {
    title: '答案',
    dataIndex: 'answer',
    key: 'answer',
    ellipsis: true,
  },
  {
    title: '操作',
    key: 'column',
    fixed: 'right',
    width: 100,
  },
])
let formState = reactive<FormState>({
  id: 0,
  product_name: '',
  keywords: '',
  sensitive_words: '',
  answer: ''
});
onMounted(() => {
  getList()
})
//获取列表
const getList = () => {
  requestData(product_api.getProducts, {}, 'GET'
  ).then((res) => {
    dataSource.value = res.data.data.recordset
  })
}
//搜索
const onSearch = (value: string) => {
  console.log(value);
  searchValue.value = value
  requestData(product_api.searchproduct, { searchValue: value }
  ).then((res) => {
    console.log(res);
  })
}
//上传 ant
const handleChange = (info: UploadChangeParam) => {
  if (info.file.status !== 'uploading') {
    console.log(info.file, info.fileList);
  }
  if (info.file.status === 'done') {
    message.success(`${info.file.name} file uploaded successfully`);
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} file upload failed.`);
  }

};
//上传
const handleFileUpload = (event: any) => {
  selectedFile.value = event.target.files[0];
  const formData = new FormData();
  if (selectedFile.value !== null) {
    formData.append("file", new Blob([selectedFile.value]));
  }
  requestData(product_api.uploadProduct, formData
  ).then(() => {
    // dataSource.value = res.data
    notification.success({
      message: '上传成功',
      description:
        '上传成功',
      icon: () => h(SmileOutlined, { style: 'color: #108ee9' }),
    });
    getList()
  })
}
//弹窗
const showModal = (record: FormState) => {
  console.log(record);
  formState = record
  open.value = true;
}
//提交表单
const handleOk = async () => {
  const { data } = await requestData(product_api.updateProduct, formState)
  console.log(data);
  open.value = false;
};
const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};
const headers = {
  'Content-Type': 'multipart/form-data',
};
// defineProps<{ dataSource: Array<string> }>()

</script>
<style scoped>
.read-the-docs {
  color: #888;
}

.ma {
  margin: 20px 0;
}
</style>
