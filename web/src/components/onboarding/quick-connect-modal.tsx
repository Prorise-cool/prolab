"use client";

import { useEffect, useMemo, useState } from "react";
import { App, Button, Checkbox, Empty, Input, Modal, Space, Spin, Steps, Tag } from "antd";
import { Check, RefreshCw, WandSparkles } from "lucide-react";

import { DEFAULT_UPSTREAM, normalizeBaseUrl } from "@/lib/pro-spec/constants";
import { inferModelInfo } from "@/lib/pro-spec/model-inference";
import { getModelLogoById } from "@/lib/pro-spec/model-logo";
import { fetchProApiTokenUsage, formatUsageAmount, summarizeModelCategories, type ProApiTokenUsage } from "@/lib/pro-spec/proapi-usage";
import { fetchChannelModels } from "@/services/api/image";
import { configWithQuickConnectChannel, createModelChannel, normalizeChannelModels, type AiConfig, useConfigStore } from "@/stores/use-config-store";

type QuickConnectModalProps = {
    open: boolean;
    initialApiKey?: string;
    initialBaseUrl?: string;
    onClose: () => void;
};

type ModelItem = {
    id: string;
    group: string;
    category: string;
    apiFormat: string;
    logo?: string;
};

const defaultBaseUrl = normalizeBaseUrl(DEFAULT_UPSTREAM.baseUrl);

export function QuickConnectModal({ open, initialApiKey = "", initialBaseUrl = defaultBaseUrl, onClose }: QuickConnectModalProps) {
    const { message } = App.useApp();
    const config = useConfigStore((state) => state.config);
    const updateConfig = useConfigStore((state) => state.updateConfig);
    const [step, setStep] = useState(0);
    const [apiKey, setApiKey] = useState(initialApiKey);
    const [baseUrl, setBaseUrl] = useState(initialBaseUrl || defaultBaseUrl);
    const [loading, setLoading] = useState(false);
    const [models, setModels] = useState<ModelItem[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [usage, setUsage] = useState<ProApiTokenUsage | null>(null);
    const [usageError, setUsageError] = useState("");

    useEffect(() => {
        if (!open) return;
        setStep(0);
        setApiKey(initialApiKey);
        setBaseUrl(initialBaseUrl || defaultBaseUrl);
        setModels([]);
        setSelected([]);
        setUsage(null);
        setUsageError("");
    }, [initialApiKey, initialBaseUrl, open]);

    const modelSummary = useMemo(() => summarizeModelCategories(models.map((model) => model.id)), [models]);

    const groupedModels = useMemo(() => {
        const groups = new Map<string, ModelItem[]>();
        for (const model of models) {
            const group = groups.get(model.group) || [];
            group.push(model);
            groups.set(model.group, group);
        }
        return Array.from(groups.entries()).map(([group, items]) => ({ group, items }));
    }, [models]);

    const loadModels = async () => {
        const normalizedBaseUrl = normalizeBaseUrl(baseUrl || defaultBaseUrl);
        if (!apiKey.trim()) {
            message.error("请先填写 API Key");
            return;
        }
        setLoading(true);
        try {
            const channel = createModelChannel({
                id: config.channels[0]?.id || "default",
                name: "ProAPI",
                baseUrl: normalizedBaseUrl,
                apiKey: apiKey.trim(),
                apiFormat: "openai",
            });
            const [ids, usageResult] = await Promise.all([
                fetchChannelModels(channel),
                fetchProApiTokenUsage({ baseUrl: normalizedBaseUrl, apiKey: apiKey.trim() })
                    .then((value) => ({ value, error: "" }))
                    .catch((error) => ({ value: null, error: error instanceof Error ? error.message : "额度查询失败" })),
            ]);
            const nextModels = ids.map((id) => {
                const info = inferModelInfo(id);
                return {
                    id,
                    group: info.group,
                    category: info.category,
                    apiFormat: info.apiFormat,
                    logo: getModelLogoById(id),
                };
            });
            setBaseUrl(normalizedBaseUrl);
            setModels(nextModels);
            setSelected(nextModels.map((model) => model.id));
            setUsage(usageResult.value);
            setUsageError(usageResult.error);
            setStep(1);
            message.success(`已拉取 ${nextModels.length} 个模型`);
        } catch (error) {
            message.error(error instanceof Error ? error.message : "模型列表拉取失败");
        } finally {
            setLoading(false);
        }
    };

    const complete = () => {
        if (!selected.length) {
            message.error("请至少选择一个模型");
            return;
        }
        const channel = createModelChannel({
            id: config.channels[0]?.id || "default",
            name: "ProAPI",
            baseUrl: normalizeBaseUrl(baseUrl || defaultBaseUrl),
            apiKey: apiKey.trim(),
            apiFormat: "openai",
            models: normalizeChannelModels(selected),
        });
        saveConfig(configWithQuickConnectChannel(config, channel));
        message.success("ProAPI 一键接入已完成");
        onClose();
    };

    const saveConfig = (nextConfig: AiConfig) => {
        (Object.keys(nextConfig) as Array<keyof AiConfig>).forEach((key) => updateConfig(key, nextConfig[key]));
    };

    const selectAll = () => setSelected(models.map((model) => model.id));
    const invertSelection = () => {
        const current = new Set(selected);
        setSelected(models.filter((model) => !current.has(model.id)).map((model) => model.id));
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <WandSparkles className="size-5" />
                    <span>ProAPI 一键接入</span>
                </div>
            }
            open={open}
            width={860}
            centered
            onCancel={onClose}
            styles={{ body: { maxHeight: "72vh", overflowY: "auto", paddingRight: 12 } }}
            footer={
                step === 0 ? (
                    <Button type="primary" loading={loading} icon={<RefreshCw className="size-4" />} onClick={() => void loadModels()}>
                        下一步
                    </Button>
                ) : (
                    <Space>
                        <Button onClick={() => setStep(0)}>上一步</Button>
                        <Button type="primary" icon={<Check className="size-4" />} onClick={complete}>
                            完成
                        </Button>
                    </Space>
                )
            }
        >
            <Steps
                className="mb-5"
                size="small"
                current={step}
                items={[
                    { title: "连接" },
                    { title: "选择模型" },
                ]}
            />

            {step === 0 ? (
                <div className="space-y-4">
                    <div>
                        <div className="mb-1.5 text-sm font-medium">Base URL</div>
                        <Input value={baseUrl} placeholder={defaultBaseUrl} onChange={(event) => setBaseUrl(event.target.value)} />
                    </div>
                    <div>
                        <div className="mb-1.5 text-sm font-medium">API Key（sk- 开头）</div>
                        <Input.Password value={apiKey} placeholder="sk-..." onChange={(event) => setApiKey(event.target.value)} onPressEnter={() => void loadModels()} />
                    </div>
                    {loading ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Spin size="small" />
                            <span>正在读取模型列表</span>
                        </div>
                    ) : null}
                </div>
            ) : (
                <div>
                    <div className="mb-4 grid gap-2 rounded-lg border border-border p-3 text-sm md:grid-cols-4">
                        <div>
                            <div className="text-xs text-muted-foreground">模型</div>
                            <div className="mt-1 font-semibold">{modelSummary.total} 个</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">图像 / 视频</div>
                            <div className="mt-1 font-semibold">
                                {modelSummary.image} / {modelSummary.video}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">剩余额度</div>
                            <div className="mt-1 font-semibold">{usage ? (usage.unlimitedQuota ? "无限额度" : formatUsageAmount(usage.totalAvailable)) : "-"}</div>
                        </div>
                        <div>
                            <div className="text-xs text-muted-foreground">模型白名单</div>
                            <div className="mt-1 font-semibold">{usage ? (usage.modelLimitsEnabled ? `${usage.modelLimits.length} 个` : "未限制") : "-"}</div>
                        </div>
                        {usageError ? <div className="text-xs text-muted-foreground md:col-span-4">额度未读取：{usageError}</div> : null}
                    </div>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-muted-foreground">
                            已选择 {selected.length} / {models.length} 个模型
                        </div>
                        <Space>
                            <Button size="small" onClick={selectAll}>
                                全选
                            </Button>
                            <Button size="small" onClick={invertSelection}>
                                反选
                            </Button>
                        </Space>
                    </div>
                    {groupedModels.length ? (
                        <Checkbox.Group className="flex w-full flex-col gap-4" value={selected} onChange={(values) => setSelected(values.map(String))}>
                            {groupedModels.map(({ group, items }) => (
                                <section key={group} className="rounded-lg border border-border p-3">
                                    <div className="mb-3 flex items-center justify-between gap-3">
                                        <div className="text-sm font-semibold">{group}</div>
                                        <Tag className="m-0">{items.length} 个</Tag>
                                    </div>
                                    <div className="grid gap-2 md:grid-cols-2">
                                        {items.map((model) => (
                                            <Checkbox key={model.id} value={model.id} className="min-w-0 rounded-md px-2 py-1.5 transition hover:bg-accent">
                                                <span className="inline-flex min-w-0 items-center gap-2 align-middle">
                                                    {model.logo ? <img src={model.logo} alt="" className="size-4 shrink-0" /> : null}
                                                    <span className="min-w-0 truncate">{model.id}</span>
                                                    <Tag className="m-0 shrink-0 text-[11px]">{model.category}</Tag>
                                                    <Tag className="m-0 shrink-0 text-[11px]">{model.apiFormat}</Tag>
                                                </span>
                                            </Checkbox>
                                        ))}
                                    </div>
                                </section>
                            ))}
                        </Checkbox.Group>
                    ) : (
                        <Empty description="暂无模型" />
                    )}
                </div>
            )}
        </Modal>
    );
}
