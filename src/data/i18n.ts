import type {
  BusinessScope,
  DealStatus,
  EngineeringServiceType,
  Language,
  SiteType,
  WorkflowStage,
} from '../types/masbina.ts';

export const BUSINESS_SCOPE_LABELS: Record<BusinessScope, { en: string; zh: string }> = {
  'CCTV Surveillance System': {
    en: 'CCTV Surveillance System',
    zh: '闭路电视监控系统',
  },
  'Alarm System': {
    en: 'Alarm System',
    zh: '防盗报警系统',
  },
  'Access Control System': {
    en: 'Access Control System',
    zh: '门禁及出入管理系统',
  },
  'Automation System': {
    en: 'Automation System',
    zh: '自动化系统',
  },
  'Security Products Retail': {
    en: 'Security Products Retail',
    zh: '保安系统产品零售',
  },
};

export const ENGINEERING_SERVICE_LABELS: Record<
  EngineeringServiceType,
  { en: string; zh: string }
> = {
  Consultation: { en: 'Consultation', zh: '客户咨询' },
  Design: { en: 'Design', zh: '系统设计' },
  'Supply & Retail': { en: 'Supply & Retail', zh: '产品供应及零售' },
  Installation: { en: 'Installation', zh: '工程安装' },
  'Testing & Commissioning': {
    en: 'Testing & Commissioning',
    zh: '测试与系统调试',
  },
  'Maintenance & Support': {
    en: 'Maintenance & Support',
    zh: '定期维护及技术支援',
  },
};

export const WORKFLOW_STAGE_LABELS: Record<WorkflowStage, { en: string; zh: string }> = {
  Consultation: { en: 'Consultation', zh: '客户需求分析' },
  'Design & Quotation': { en: 'Design & Quotation', zh: '系统设计与报价' },
  'Supply & Installation': {
    en: 'Supply & Installation',
    zh: '产品供应与现场施工',
  },
  'Testing & Handover': { en: 'Testing & Handover', zh: '测试、验收与交付' },
  'Maintenance & Support': {
    en: 'Maintenance & Support',
    zh: '定期维护与售后服务',
  },
};

export const DEAL_STATUS_LABELS: Record<DealStatus, { en: string; zh: string }> = {
  'New Lead': { en: 'New Lead', zh: '新线索' },
  'Quotation Sent': { en: 'Quotation Sent', zh: '已发报价' },
  Negotiating: { en: 'Negotiating', zh: '洽谈中' },
  'Closed Won': { en: 'Closed Won', zh: '已成交' },
  'Closed Lost': { en: 'Closed Lost', zh: '已流失' },
};

export const SITE_TYPE_LABELS: Record<SiteType, { en: string; zh: string }> = {
  Factory: { en: 'Factory', zh: '工厂' },
  Office: { en: 'Office', zh: '办公室' },
  Residential: { en: 'Residential', zh: '住宅' },
  Warehouse: { en: 'Warehouse', zh: '仓库' },
  Commercial: { en: 'Commercial', zh: '商业店铺' },
  'Industrial Park': { en: 'Industrial Park', zh: '工业园' },
  Other: { en: 'Other', zh: '其他场地' },
};

export interface SampleMeetingCase {
  id: string;
  labelEn: string;
  labelZh: string;
  notes: string;
  voiceTranscript?: string;
}

export const SAMPLE_MEETING_CASES: SampleMeetingCase[] = [
  {
    id: 'senai-factory',
    labelEn: 'Senai Factory — CCTV, Biometric Access & Auto Gate',
    labelZh: '士乃工业园工厂 — 监控、指纹门禁与电动门',
    notes: `Met Mr. Tan (012-789 4521), Operations Manager at Sinergi Metalworks Sdn Bhd, Senai Industrial Park factory.
Current site has blind spots at loading bay and old analog cameras keep dropping signal.
Needs:
- 16 units 4MP IP CCTV cameras (outdoor weatherproof bullet + indoor dome) with 1x 16-ch NVR + 8TB surveillance HDD
- 2 doors biometric + RFID access control for main office & server room (with EM lock & exit button)
- 1 heavy-duty sliding auto gate (1500kg industrial motor) for main lorry entrance
Wants full cabling, installation, testing & commissioning completed by next month, plus optional annual preventive maintenance quote.
Follow up with Mr. Tan this Friday with formal quotation and site layout proposal.`,
    voiceTranscript: `刚从Senai Industrial Park出来，见了Sinergi Metalworks的Mr. Tan。厂区装货区很多盲点，旧的CCTV经常断线。他要换16粒4MP IP CCTV加一台NVR，办公室和机房做2个门的指纹门禁，大门口要装一台重型滑动电动门。下个月底前要全部安装调试好，这个星期五跟进发正式报价单。`,
  },
  {
    id: 'puchong-office',
    labelEn: 'Puchong HQ — Alarm System & Office Access Control',
    labelZh: '蒲种总部 — 防盗报警与办公室门禁升级',
    notes: `Site visit with Ms. Lim Wei Ling (016-332 8890) from Veridian Logistics HQ at Bandar Puteri Puchong (3-storey corporate office).
Pain points: Staff still sharing physical keys, no intrusion alert after 7pm, need audit trail for finance & warehouse door.
Requirements:
- 1x 16-zone Hybrid Intrusion Alarm Panel with GSM/App notification, 8 PIR motion sensors, 4 magnetic door contacts, 2 indoor/outdoor sirens
- 3 doors facial recognition & card access control with time attendance software
- 4 units 4MP indoor dome CCTV for reception and corridor monitoring
Stage: Ready for system design and quotation. Next follow-up next Tuesday morning.`,
  },
  {
    id: 'mount-austin-bungalow',
    labelEn: 'Mount Austin — Residential Security & Retail Supply',
    labelZh: '茂奥斯汀住宅 — 别墅监控、报警与电动门',
    notes: `Walk-in consultation with Dato' Rashid (019-711 2045) for his corner-lot bungalow at Taman Mount Austin, Johor Bahru.
Looking for reliable home perimeter protection and smartphone viewing while travelling.
Needs:
- 8 units 5MP ColorVu IP CCTV cameras + 8-ch PoE NVR
- Wireless perimeter alarm system (8 zones) + outdoor beam sensors
- 1 set heavy-duty underground/arm swing auto gate with backup battery
- Also purchasing 2 extra smart Wi-Fi indoor cameras over the counter (Security Products Retail).
Wants quotation within 2 days and quarterly maintenance option.`,
  },
];

export const UI_TEXT = {
  en: {
    brandName: 'Masbina Technology S/B',
    brandTagline: 'Integrated Security & Automation Solutions',
    navQuickEntry: 'AI Quick Entry',
    navCrmBoard: 'CRM Follow-Up Board',
    navQuotationBuilder: 'Quotation Builder',
    currencyLabel: 'Currency: MYR (RM)',
    frameworkLabel: 'Masbina Engineering Framework',

    // Quick Entry
    quickEntryTitle: 'AI Meeting Note Parser',
    quickEntrySubtitle:
      'Enter unstructured post-meeting notes, paste a voice transcript, or attach a site floor plan. Gemini structures a CRM follow-up report and engineering quotation draft.',
    loadSampleBtn: 'Load Sample Meeting Note',
    rawNotesLabel: 'Post-Meeting Field Notes (EN / 中文 / Manglish)',
    rawNotesPlaceholder:
      'Example: Met Mr. Tan at Senai Industrial Park factory. Needs 16 units 4MP IP CCTV cameras, 1 NVR, 2 doors biometric access control, and 1 heavy-duty sliding auto gate...',
    voiceTabLabel: 'Voice-Note Transcript / Dictation',
    voicePlaceholder:
      'Paste WhatsApp/WeChat voice-note transcript here, or click Dictate to speak directly...',
    dictateStart: 'Dictate Voice Note',
    dictateStop: 'Stop Listening',
    dictateUnsupported: 'Live dictation is unavailable in this browser; paste transcript directly.',
    imageUploadLabel: 'Site Sketch / Floor Plan (Optional)',
    imageUploadHint: 'Upload PNG, JPG, or WEBP site drawing so AI can factor in camera & door placements.',
    removeImage: 'Remove',
    generateBtn: 'Generate Report & Quotation',
    generatingBtn: 'Analyzing Notes & Structuring Quotation...',
    clearBtn: 'Clear',
    outputEmptyTitle: 'Ready to Parse Field Notes',
    outputEmptyDesc:
      'Generated outputs automatically classify requirements across Masbina’s 5 business scopes, 6 engineering service categories, and MYR quotation line items.',
    tabReportPreview: 'Sales Visit Report',
    tabQuotePreview: 'Quotation Draft',
    savedToWorkspace: 'Saved to CRM & Quotation Builder',
    openInCrm: 'Open in CRM Board',
    openInQuotation: 'Edit Quotation',
    sampleCaseLabel: 'Sample Scenarios',

    // CRM Board
    crmTitle: 'CRM Sales Visit & Follow-Up Tracker',
    crmSubtitle: 'Track site visits, technical requirements, engineering pipeline stages, and linked quotations.',
    newRecordBtn: 'New Visit Record',
    searchPlaceholder: 'Search client, contact, location, or requirements...',
    allStatuses: 'All Statuses',
    allStages: 'All Stages',
    kpiPipelineValue: 'Active Pipeline Value',
    kpiTotalVisits: 'Total Sales Visits',
    kpiQuotationStage: 'In Quotation / Negotiation',
    kpiClosedWon: 'Closed Won Value',
    colClient: 'Client & Site',
    colContact: 'Contact',
    colScopes: 'Business Scopes',
    colStage: 'Workflow Stage',
    colStatus: 'Deal Status',
    colFollowUp: 'Next Follow-Up',
    colEstimate: 'Quote Value (RM)',
    emptyCrmTitle: 'No matching sales visit records',
    emptyCrmDesc: 'Adjust your filters or generate a new visit record using AI Quick Entry.',
    editDrawerTitle: 'Sales Visit Record',
    fieldClientName: 'Client / Company Name',
    fieldContactPerson: 'Contact Person',
    fieldContactPhone: 'Phone Number',
    fieldSiteType: 'Site Type',
    fieldLocation: 'Site Location',
    fieldScopes: 'Selected Business Scopes',
    fieldWorkflowStage: 'Current Workflow Stage',
    fieldDealStatus: 'Deal Status',
    fieldNextFollowUp: 'Next Follow-Up Date',
    fieldPainPoints: 'Client Pain Points',
    fieldTechReq: 'Technical Requirements Summary',
    fieldActionItems: 'Action Items (one per line)',
    viewLinkedQuote: 'Open Linked Quotation',
    createLinkedQuote: 'Create Quotation for Client',
    deleteRecord: 'Delete Record',
    confirmDelete: 'Confirm Delete',
    cancel: 'Cancel',
    saveChanges: 'Saved Automatically',
    closePanel: 'Close',

    // Quotation Builder
    quoteTitle: 'Engineering Quotation Builder',
    quoteSubtitle: 'Structure equipment supply, engineering services, and optional maintenance plans in MYR.',
    selectQuotation: 'Active Quotation',
    newQuotationBtn: 'New Quotation',
    duplicateQuotationBtn: 'Duplicate',
    previewPrintBtn: 'Preview & Print PDF',
    quoteRefLabel: 'Quotation Ref No.',
    issueDateLabel: 'Issue Date',
    validityDateLabel: 'Valid Until',
    projectTitleLabel: 'Project Title',
    preparedByLabel: 'Prepared By',
    sectionATitle: 'Section A: Equipment Supply & Retail',
    sectionBTitle: 'Section B: Engineering Services',
    sectionCTitle: 'Section C: Optional Maintenance Plan',
    addEquipment: 'Add Equipment Item',
    addService: 'Add Engineering Service',
    addMaintenance: 'Add Maintenance Plan',
    colItem: 'Item Description',
    colBrandSpec: 'Brand / Specification',
    colScope: 'Scope',
    colCategory: 'Service Category',
    colFrequency: 'Billing Cycle',
    colQty: 'Qty',
    colUnit: 'Unit',
    colUnitPrice: 'Unit Price (RM)',
    colTotal: 'Total (RM)',
    includeMaintenanceLabel: 'Include Section C in Grand Total',
    subtotalEquipment: 'Section A Subtotal (Equipment)',
    subtotalServices: 'Section B Subtotal (Services)',
    subtotalMaintenance: 'Section C Subtotal (Maintenance)',
    optionalExcluded: 'Optional — excluded from Grand Total',
    combinedSubtotal: 'Combined Subtotal',
    discountLabel: 'Discount',
    sstLabel: 'SST (Sales & Service Tax)',
    sstZero: '0% (Exempt / N/A)',
    sstEight: '8% SST',
    grandTotalLabel: 'Grand Total (MYR)',
    termsLabel: 'Terms & Conditions (one per line)',
    notesLabel: 'Special Engineering Remarks',
    printSavePdf: 'Print / Save as PDF',
    closePreview: 'Close Preview',
    emptyQuotationTitle: 'No quotations created yet',
    emptyQuotationDesc: 'Use AI Quick Entry or create a blank engineering quotation to begin.',
  },
  zh: {
    brandName: 'Masbina Technology S/B',
    brandTagline: '综合安防与自动化工程解决方案',
    navQuickEntry: '智能录入',
    navCrmBoard: '客户跟进表',
    navQuotationBuilder: '报价单制作',
    currencyLabel: '结算货币：MYR (RM)',
    frameworkLabel: 'Masbina 工程业务架构',

    // Quick Entry
    quickEntryTitle: '智能拜访记录解析器',
    quickEntrySubtitle:
      '输入原始拜访笔记、粘贴语音转文字记录，或上传现场草图/平面图。AI 将同步生成结构化销售拜访汇报表与工程报价单草稿。',
    loadSampleBtn: '加载测试案例',
    rawNotesLabel: '拜访原始记录（支持中文 / 英文 / 混合口语）',
    rawNotesPlaceholder:
      '示例：在 Senai Industrial Park 拜访陈先生工厂。需要16个4MP IP闭路电视摄像头、1台NVR、2道指纹门禁及1套重型电动门...',
    voiceTabLabel: '语音笔记转录 / 实时语音录入',
    voicePlaceholder: '粘贴 WhatsApp / 微信语音转文字内容，或点击下方按钮直接语音口述...',
    dictateStart: '开始语音录入',
    dictateStop: '停止语音录入',
    dictateUnsupported: '当前浏览器不支持实时语音识别，请直接粘贴语音转文字内容。',
    imageUploadLabel: '现场草图 / 平面图上传（选填）',
    imageUploadHint: '支持 PNG、JPG、WEBP 格式，AI 将结合图纸估算点位与安装工程量。',
    removeImage: '移除图片',
    generateBtn: '生成汇报与报价',
    generatingBtn: '正在解析拜访记录并生成报价单...',
    clearBtn: '清空输入',
    outputEmptyTitle: '等待解析拜访记录',
    outputEmptyDesc:
      '解析结果将严格按 Masbina 五大业务范围、六大工程服务类别及马币 (RM) 报价结构自动归类。',
    tabReportPreview: '销售拜访汇报表',
    tabQuotePreview: '工程报价单草稿',
    savedToWorkspace: '已自动保存至客户跟进表与报价单',
    openInCrm: '前往客户跟进表查看',
    openInQuotation: '前往报价单编辑器',
    sampleCaseLabel: '快速测试案例',

    // CRM Board
    crmTitle: '销售汇报与跟进看板',
    crmSubtitle: '集中管理客户现场拜访记录、技术需求摘要、工程推进阶段及关联报价单。',
    newRecordBtn: '新增拜访记录',
    searchPlaceholder: '搜索客户名称、联系人、地点或技术需求...',
    allStatuses: '全部状态',
    allStages: '全部工程阶段',
    kpiPipelineValue: '活跃商机总额',
    kpiTotalVisits: '累计拜访记录',
    kpiQuotationStage: '报价与洽谈中',
    kpiClosedWon: '已成交金额',
    colClient: '客户与场地',
    colContact: '联系人',
    colScopes: '涉及业务范围',
    colStage: '当前工程阶段',
    colStatus: '商机状态',
    colFollowUp: '下次跟进日期',
    colEstimate: '报价金额 (RM)',
    emptyCrmTitle: '暂无符合条件的拜访记录',
    emptyCrmDesc: '请调整筛选条件，或使用「智能录入」解析新的客户拜访记录。',
    editDrawerTitle: '编辑销售拜访记录',
    fieldClientName: '客户 / 公司名称',
    fieldContactPerson: '联系人',
    fieldContactPhone: '联系电话',
    fieldSiteType: '场地类型',
    fieldLocation: '项目地点',
    fieldScopes: '涉及业务标签（可多选）',
    fieldWorkflowStage: '当前工程阶段',
    fieldDealStatus: '商机状态',
    fieldNextFollowUp: '下次跟进日期',
    fieldPainPoints: '客户痛点摘要',
    fieldTechReq: '技术需求与配置要求',
    fieldActionItems: '下一步行动项（每行一项）',
    viewLinkedQuote: '打开关联报价单',
    createLinkedQuote: '为此客户新建报价单',
    deleteRecord: '删除记录',
    confirmDelete: '确认删除',
    cancel: '取消',
    saveChanges: '修改已自动保存',
    closePanel: '关闭',

    // Quotation Builder
    quoteTitle: '智能工程报价单生成器',
    quoteSubtitle: '按产品供应、工程服务及定期维护配套结构化编制马币 (RM) 正式报价单。',
    selectQuotation: '当前报价单',
    newQuotationBtn: '新建报价单',
    duplicateQuotationBtn: '复制一份',
    previewPrintBtn: '正式报价预览 / 打印 PDF',
    quoteRefLabel: '报价单编号',
    issueDateLabel: '报价日期',
    validityDateLabel: '有效日期',
    projectTitleLabel: '工程项目名称',
    preparedByLabel: '制表工程师',
    sectionATitle: 'Section A：产品供应明细 (Equipment Supply & Retail)',
    sectionBTitle: 'Section B：工程服务费用 (Engineering Services)',
    sectionCTitle: 'Section C：定期维护配套 (Optional Maintenance Plan)',
    addEquipment: '新增产品行',
    addService: '新增工程服务行',
    addMaintenance: '新增维护配套行',
    colItem: '项目名称',
    colBrandSpec: '品牌 / 规格参数',
    colScope: '所属业务',
    colCategory: '工程服务类别',
    colFrequency: '维护周期',
    colQty: '数量',
    colUnit: '单位',
    colUnitPrice: '单价 (RM)',
    colTotal: '小计 (RM)',
    includeMaintenanceLabel: '将 Section C 维护配套计入报价总计',
    subtotalEquipment: 'Section A 产品供应小计',
    subtotalServices: 'Section B 工程服务小计',
    subtotalMaintenance: 'Section C 维护配套小计',
    optionalExcluded: '选配项 — 未计入总价',
    combinedSubtotal: '合计小计 (Subtotal)',
    discountLabel: '折扣优惠 (Discount)',
    sstLabel: '销售与服务税 (SST)',
    sstZero: '0%（免税 / 不适用）',
    sstEight: '8% SST',
    grandTotalLabel: '报价总计 (MYR)',
    termsLabel: '商务条款与保修说明（每行一条）',
    notesLabel: '工程特别备注',
    printSavePdf: '打印 / 另存为 PDF',
    closePreview: '关闭预览',
    emptyQuotationTitle: '尚未创建任何报价单',
    emptyQuotationDesc: '请通过「智能录入」自动生成，或点击新建空白工程报价单。',
  },
} as const;

export function getScopeLabel(scope: BusinessScope, lang: Language): string {
  return BUSINESS_SCOPE_LABELS[scope]?.[lang] ?? scope;
}

export function getServiceLabel(service: EngineeringServiceType, lang: Language): string {
  return ENGINEERING_SERVICE_LABELS[service]?.[lang] ?? service;
}

export function getStageLabel(stage: WorkflowStage, lang: Language): string {
  return WORKFLOW_STAGE_LABELS[stage]?.[lang] ?? stage;
}

export function getStatusLabel(status: DealStatus, lang: Language): string {
  return DEAL_STATUS_LABELS[status]?.[lang] ?? status;
}

export function getSiteTypeLabel(siteType: SiteType, lang: Language): string {
  return SITE_TYPE_LABELS[siteType]?.[lang] ?? siteType;
}
