<template>
  <h1>Excel导入解析</h1>
  <a-card title="导入表格格式" class="ma">
    <p>多个关键词和多个敏感词必须/分割</p>
    <p>请确保excel表格有数据,并且按照既定格式来</p>
    <p>表头依次设置为product_name，keywords，sensitive_words，answer，issue</p>
  </a-card>
  <div class="ma table-header">
    <a-input-search style="width: 300px;" v-model:value="searchValue" placeholder="input search text" enter-button
      @search="onSearch" />
    <a-button type="primary" @Click="handleExcel">导出Excel</a-button>
    <a-upload name="file" action="http://localhost:3000/upload" :headers="headers" @change="handleChange">
      <a-button style="margin: 20px 0;">
        <upload-outlined></upload-outlined>
        导入Excel
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
  <a-modal v-model:open="uploadOpen" title="上传列表" @ok="handleUpload" ok-text="确认" cancel-text="取消" style="width:80vw;">
    <h2 style="text-align: center;">请核对数据，如确认无误点击确认即可更新列表</h2>
    <a-table :dataSource="dataUpload" :columns="columns">
      <template #bodyCell="{ record, column }">
        <template v-if="column.key === 'column'">
          <a-tag :bordered="false" color="processing" style="cursor: pointer;" @Click="showModal(record)">修改</a-tag>
        </template>
      </template>
    </a-table>
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
interface DataTabel {
  product_name: string;
  keywords: string;
  sensitive_words: string;
  answer: string;
}
let searchValue = ref('')
let dataSource = ref<Array<DataTabel>>([])
let dataUpload = ref<Array<DataTabel>>([])
const open = ref<boolean>(false);
const uploadOpen = ref<boolean>(false);
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
    dataSource.value = res.data.recordset
  })
}
//搜索
const onSearch = (value: string) => {
  searchValue.value = value
  requestData(product_api.searchproduct, { keywords: value }
  ).then((res) => {
    const { recordset = [] } = res.data
    dataSource.value = recordset
    console.log(recordset);
  })
}
//上传
const handleChange = (info: UploadChangeParam) => {
  if (info.file.status !== 'uploading') {
    if (info.file.response.code === 200) {
      uploadOpen.value = true;
      dataUpload.value = info.file.response.data
    }
  }
  if (info.file.status === 'done') {
    message.success(`${info.file.name} 上传解析成功`);
  } else if (info.file.status === 'error') {
    message.error(`${info.file.name} file upload failed.`);
  }

};
//导出
const handleExcel = () => {
  requestData(product_api.exportProduct, {}, 'GET'
  ).then((res) => {
    notification.success({
      message: res.data.msg,
      description:
        '路径为D:\code\my-node-project',
      icon: () => h(SmileOutlined, { style: 'color: #108ee9' }),
    });
  })
}
//弹窗
const showModal = (record: FormState) => {
  console.log(record);
  formState = record
  open.value = true;
}
//关闭导入弹窗
const handleUpload = () => {
  console.log(dataUpload.value);
  requestData(product_api.saveExcel, { data: dataUpload.value }
  ).then(() => {
    getList()
    uploadOpen.value = false;
  })
}
//提交表单
const handleOk = async () => {
  if (!uploadOpen.value) {
    await requestData(product_api.updateProduct, formState)
  }
  open.value = false;
};
const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};
const headers = {
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

.table-header {
  display: flex;
  align-items: center;
  gap: 15px;
}
</style>
