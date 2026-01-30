<template>
  <div class="modelCard" @click="onEdit">
    <div class="modelCardHeader">
      <div class="modelInfo">
        <!-- <div class="modelIcon">
          <i-video theme="outline" size="18" fill="currentColor" />
        </div> -->
        <div class="modelMeta">
          <h4 class="modelName">{{ config.name }}</h4>
          <span class="modelProvider">{{ getManufacturerLabel(config.manufacturer) }}</span>
        </div>
      </div>
      <div class="modelActions" @click.stop>
        <!-- <a-tooltip :title="`测试视频 (${config.manufacturer === 'volcengine' ? '2秒' : '10秒'})`">
          <button class="actionBtn" :class="{ loading: testLoading }" @click="onTestVideo" :disabled="testLoading">
            <a-spin v-if="testLoading" size="small" />
            <i-video theme="outline" size="16" fill="currentColor" v-else />
          </button>
        </a-tooltip> -->
        <a-tooltip title="编辑">
          <button class="actionBtn" @click="onEdit">
            <i-edit theme="outline" size="16" fill="currentColor" />
          </button>
        </a-tooltip>
        <a-popconfirm title="确定要删除这个配置吗？" @confirm="onDelete" placement="topRight">
          <a-tooltip title="删除">
            <button class="actionBtn danger">
              <i-delete theme="outline" size="16" fill="currentColor" />
            </button>
          </a-tooltip>
        </a-popconfirm>
      </div>
    </div>

    <div class="modelCardBody">
      <div class="infoGrid">
        <div class="infoItem">
          <span class="infoLabel">Base URL</span>
          <span class="infoValue url">{{ config.baseUrl || "-" }}</span>
        </div>
        <div class="infoItem">
          <span class="infoLabel">优先级</span>
          <span class="infoValue">
            <span class="priorityBadge">{{ config.index }}</span>
          </span>
        </div>
        <div class="infoItem">
          <span class="infoLabel">模型</span>
          <span class="infoValue">{{ config.model ? config.model : "-" }}</span>
        </div>
        <div class="infoItem">
          <span class="infoLabel">API Key</span>
          <span class="infoValue secret">****{{ config.apiKey?.slice(-4) }}</span>
        </div>
        <div class="infoItem">
          <span class="infoLabel">创建时间</span>
          <span class="infoValue">{{ formatTime(config.createTime) }}</span>
        </div>
        <div class="infoItem full" v-if="testResult">
          <span class="infoLabel">测试结果</span>
          <span class="infoValue" :class="testResult.success ? 'success' : 'error'">
            {{ testResult.message }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import dayjs from "dayjs";
import axios from "@/utils/axios";

interface ConfigForm {
  id: number;
  name: string;
  manufacturer: string;
  index: number;
  model: string;
  baseUrl: string;
  apiKey: string;
  createTime: number;
}

const props = defineProps<{
  config: ConfigForm;
}>();

const emits = defineEmits(["edit", "delete"]);

const testLoading = ref(false);
const testResult = ref<{ success: boolean; message: string } | null>(null);

const manufacturerMap: Record<string, string> = {
  runninghub: "RunningHub",
  openAi: "OpenAI",
  volcengine: "火山引擎",
  apimart: "APIMart",
  gemini: "Gemini",
};

function getManufacturerLabel(value: string): string {
  return manufacturerMap[value] || value;
}

function formatTime(timestamp: number): string {
  if (!timestamp) return "-";
  return dayjs(timestamp).format("YYYY-MM-DD HH:mm");
}

function onEdit() {
  emits("edit", props.config);
}

function onDelete() {
  emits("delete", props.config);
}

async function onTestVideo() {
  testLoading.value = true;
  testResult.value = null;

  // volcengine 2秒，其他 10秒
  const duration = props.config.manufacturer === "volcengine" ? 2 : 10;

  try {
    const res: any = await axios.post("/other/testVideo", {
      modelName: props.config.model,
      apiKey: props.config.apiKey,
      baseURL: props.config.baseUrl,
      manufacturer: props.config.manufacturer,
      duration,
    });

    testResult.value = {
      success: true,
      message: `测试成功: ${res.data || res.message || "视频生成完成"}`,
    };
  } catch (err: any) {
    testResult.value = {
      success: false,
      message: `测试失败: ${err.message || err.error?.message || "未知错误"}`,
    };
  } finally {
    testLoading.value = false;
  }
}
</script>

<style scoped>
.modelCard {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  cursor: pointer;
  transition: all 0.2s;
}

.modelCard:hover {
  border-color: var(--mainColor);
  box-shadow: 0 4px 12px rgba(152, 16, 250, 0.08);
}

.modelCardHeader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.modelInfo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modelIcon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #ffedd5 0%, #fed7aa 100%);
  color: #f97316;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modelMeta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.modelName {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
}

.modelProvider {
  font-size: 12px;
  color: #9ca3af;
}

.modelActions {
  display: flex;
  gap: 4px;
}

.actionBtn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.2s;
}

.actionBtn:hover {
  background: #e5e7eb;
  color: #374151;
}

.actionBtn.danger:hover {
  background: #fee2e2;
  color: #ef4444;
}

.modelCardBody {
  border-top: 1px solid #f3f4f6;
  padding-top: 16px;
}

.infoGrid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

@media (max-width: 480px) {
  .infoGrid {
    grid-template-columns: 1fr;
  }
}

.infoItem {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.infoLabel {
  font-size: 12px;
  color: #9ca3af;
}

.infoValue {
  font-size: 13px;
  color: #374151;
  word-break: break-all;
}

.infoValue.url {
  color: #6b7280;
  font-size: 12px;
}

.infoValue.secret {
  font-family: monospace;
  color: #6b7280;
}

.priorityBadge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 8px;
  background: linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 100%);
  color: var(--mainColor);
  font-size: 12px;
  font-weight: 600;
  border-radius: 6px;
}

.infoItem.full {
  grid-column: 1 / -1;
}

.infoValue.success {
  color: #10b981;
  font-weight: 500;
}

.infoValue.error {
  color: #ef4444;
  font-weight: 500;
}

.actionBtn.loading {
  pointer-events: none;
  opacity: 0.7;
}

.actionBtn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
</style>
