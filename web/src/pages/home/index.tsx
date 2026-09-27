import { ArrowRight, Clapperboard, ImageIcon, MessageSquareText, Server, Share2, Sparkles, type LucideIcon } from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { App, Button, Image, Tag } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { APP_VERSION, DOCS_URL } from "@/constant/env";
import { navigationTools } from "@/constant/navigation-tools";
import i18n from "@/i18n";
import { cn } from "@/lib/utils";
import { fetchPrompts, type Prompt } from "@/services/api/prompts";
import { useConfigStore } from "@/stores/use-config-store";

type HomeFeature = {
    icon: LucideIcon;
    title: string;
    desc: string;
    href: string;
    action?: "config";
};

const features: HomeFeature[] = [
    {
        icon: ImageIcon,
        title: "AI 绘图",
        desc: "聚合 OpenAI Images、Flux、Gemini、Grok、Hunyuan 等海外标准模型，统一在 Pro Canvas 里调度。",
        href: "/image",
    },
    {
        icon: MessageSquareText,
        title: "画布助手",
        desc: "围绕选中节点和上游节点对话、生图，把结果直接插回画布，不打断创作链路。",
        href: "/canvas",
    },
    {
        icon: Clapperboard,
        title: "AI 视频",
        desc: "支持 OpenAI Video 和 Grok video chat 兼容协议，文生视频、图生视频统一入口。",
        href: "/video",
    },
    {
        icon: Server,
        title: "ProAPI 一键接入",
        desc: "粘贴 API Key 后自动拉取模型、识别类型和能力，并按模型协议生成正确请求参数。",
        href: "/settings",
        action: "config",
    },
    {
        icon: Sparkles,
        title: "模型图标与能力识别",
        desc: "模型列表自动显示 GPT、Claude、Gemini、Grok、Doubao 等图标，减少选择成本。",
        href: "/canvas",
    },
    {
        icon: Share2,
        title: "素材沉淀",
        desc: "把提示词、参考图、生成结果和画布结构沉淀在本地，下一次创作从已有经验开始。",
        href: "/assets",
    },
];

const stats = [
    { value: "40+", label: "ProAPI 模型" },
    { value: "4", label: "标准协议" },
    { value: "100+", label: "模型图标" },
    { value: "0", label: "后端数据库" },
] as const;

export default function IndexPage() {
    const { message } = App.useApp();
    const { t } = useTranslation();
    const navigate = useNavigate();
    const openConfigDialog = useConfigStore((state) => state.openConfigDialog);
    const [primaryTool] = navigationTools;
    const [promptShowcase, setPromptShowcase] = useState<Prompt[]>([]);
    const [previewIndex, setPreviewIndex] = useState(0);
    const [previewOpen, setPreviewOpen] = useState(false);

    const openConfig = () => openConfigDialog(false);

    useEffect(() => {
        void fetchPrompts({ pageSize: 12 })
            .then((data) => setPromptShowcase(data.items))
            .catch((error) => message.error(error instanceof Error ? error.message : i18n.t("home.promptError")));
    }, [message]);

    return (
        <main className="relative isolate h-full overflow-y-auto bg-background text-foreground">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:36px_36px] opacity-[0.38] [mask-image:radial-gradient(ellipse_at_top,black_0%,black_42%,transparent_78%)]" />

            <section className="relative px-6 pb-20 pt-20 lg:pb-28 lg:pt-28">
                <div className="mx-auto max-w-5xl text-center">
                    <div className="mb-8 flex justify-center">
                        <Link to="/canvas" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground transition hover:bg-accent">
                            <span className="inline-block size-1.5 rounded-full bg-green-500" />
                            {APP_VERSION} · Pro Canvas 已就绪
                            <ArrowRight className="size-3 text-muted-foreground" />
                        </Link>
                    </div>

                    <h1 className="text-balance text-5xl font-semibold leading-none tracking-normal text-foreground md:text-[64px] lg:text-[72px]">
                        The Foundation for
                        <br />
                        <span className="relative inline-block">
                            your AI Studio
                            <svg className="absolute -bottom-2 left-0 h-2 w-full text-foreground" viewBox="0 0 300 8" fill="none" preserveAspectRatio="none" aria-hidden="true">
                                <path d="M2 5C50 2 100 2 150 5C200 8 250 8 298 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </span>
                    </h1>

                    <p className="mx-auto mt-8 max-w-2xl text-balance text-lg leading-8 text-muted-foreground md:text-xl">
                        ProLab 是面向 ProAPI 用户优化的 Pro Canvas 创作工作台。把绘图、视频、对话助手、模型选择和素材沉淀放在一个干净、克制、专业的界面里。
                    </p>

                    <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                        <Button type="primary" size="large" onClick={() => navigate(`/${primaryTool.slug}`)} icon={<ArrowRight className="size-4" />} iconPlacement="end">
                            {t("home.start")}
                        </Button>
                        <Button size="large" onClick={() => navigate("/canvas")}>
                            {t("home.openCanvas")}
                        </Button>
                    </div>
                </div>

                <section className="relative mx-auto mb-20 max-w-6xl border-t border-stone-200 pt-12 dark:border-stone-800">
                    <div className="mb-8 grid gap-4 md:grid-cols-[1fr_auto_1fr] md:items-start">
                        <div />
                        <div className="max-w-2xl text-center">
                            <h2 className="text-3xl font-semibold text-stone-950 dark:text-stone-100">{t("home.showcaseTitle")}</h2>
                            <p className="mt-3 text-base leading-7 text-stone-500 dark:text-stone-400">{t("home.showcaseDescription")}</p>
                        </div>
                        <Button type="link" onClick={() => navigate("/prompts")} className="justify-self-center md:justify-self-end" icon={<ArrowRight className="size-4" />} iconPlacement="end">
                            {t("home.viewPrompts")}
                        </Button>
                    </div>
                    <div className="grid auto-rows-[210px] gap-4 md:grid-cols-4">
                        {promptShowcase.map((item, index) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => {
                                    setPreviewIndex(index);
                                    setPreviewOpen(true);
                                }}
                                className={cn(
                                    "group relative cursor-pointer overflow-hidden border border-stone-200 bg-stone-100 text-left dark:border-stone-800 dark:bg-stone-900",
                                    index === 0 && "md:col-span-2 md:row-span-2",
                                    index === 3 && "md:col-span-2",
                                )}
                            >
                                <img src={item.coverUrl} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent p-4 text-white">
                                    <div className="mb-2 flex flex-wrap gap-1.5">
                                        {item.tags.slice(0, 2).map((tag) => (
                                            <Tag key={tag} variant="filled" className="m-0 bg-white/15 text-[11px] text-white backdrop-blur">
                                                {tag}
                                            </Tag>
                                        ))}
                                    </div>
                                    <h3 className="text-sm font-medium">{item.title}</h3>
                                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/75">{item.prompt}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </section>
            </section>

            <section className="relative border-y border-border bg-background">
                <div className="mx-auto grid max-w-5xl grid-cols-2 md:grid-cols-4">
                    {stats.map((item, index) => (
                        <div key={item.label} className={`border-border px-6 py-8 text-center ${index > 0 ? "md:border-l" : ""} ${index % 2 === 1 ? "border-l" : ""} ${index >= 2 ? "border-t md:border-t-0" : ""}`}>
                            <div className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">{item.value}</div>
                            <div className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="relative px-6 py-20 lg:py-28">
                <div className="mx-auto max-w-5xl">
                    <div className="mb-12 max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            <span className="h-px w-6 bg-muted-foreground" />
                            Features
                        </div>
                        <h2 className="text-3xl font-semibold tracking-normal text-foreground md:text-4xl">一个工作台，所有 AI 创作能力。</h2>
                        <p className="mt-3 text-base leading-7 text-muted-foreground">从绘图到视频，从模型选择到参数适配，统一的画布任务流让多模型协作像本地软件一样自然。</p>
                    </div>

                    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border md:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            const inner = (
                                <>
                                    <div className="mb-3 flex items-center gap-3">
                                        <div className="flex size-9 items-center justify-center rounded-lg border border-border bg-background transition-colors group-hover:border-foreground">
                                            <Icon className="size-4 text-foreground" />
                                        </div>
                                        <h3 className="text-base font-medium text-foreground">{feature.title}</h3>
                                    </div>
                                    <p className="text-sm leading-6 text-muted-foreground">{feature.desc}</p>
                                </>
                            );

                            if (feature.action === "config") {
                                return (
                                    <button key={feature.title} type="button" onClick={openConfig} className="group bg-background p-6 text-left transition hover:bg-accent">
                                        {inner}
                                    </button>
                                );
                            }

                            return (
                                <Link key={feature.title} to={feature.href} className="group bg-background p-6 transition hover:bg-accent">
                                    {inner}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>

            <section className="relative px-6 pb-24">
                <div className="mx-auto max-w-5xl">
                    <div className="relative overflow-hidden rounded-lg border border-border bg-background px-8 py-14 text-center md:p-14">
                        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_0%,transparent_70%)]" />

                        <h2 className="relative text-3xl font-semibold tracking-normal text-foreground md:text-4xl">准备好开始你的下一次创作？</h2>
                        <p className="relative mx-auto mt-3 max-w-xl text-base leading-7 text-muted-foreground">不用切换工具，不用手动猜模型协议。打开浏览器，贴 API Key，然后让模型、图标和参数自动就位。</p>
                        <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
                            <Link to="/canvas" className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground transition active:scale-[0.98]">
                                进入 Pro Canvas
                                <ArrowRight className="size-4" />
                            </Link>
                            <button type="button" onClick={openConfig} className="inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium text-foreground transition hover:bg-accent">
                                <Server className="size-4" />
                                一键接入
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="relative border-t border-border bg-background">
                <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-8 text-sm text-muted-foreground md:flex-row">
                    <div>© {new Date().getFullYear()} ProLab · Pro Canvas for ProAPI</div>
                    <div className="flex flex-wrap items-center justify-center gap-5">
                        <button type="button" onClick={openConfig} className="transition hover:text-foreground">
                            设置
                        </button>
                        <Link to="/prompts" className="transition hover:text-foreground">
                            提示词库
                        </Link>
                        <a href={DOCS_URL} target="_blank" rel="noreferrer" className="transition hover:text-foreground">
                            文档
                        </a>
                        <a href="https://canvas.best/" target="_blank" rel="noreferrer" className="transition hover:text-foreground">
                            canvas.best
                        </a>
                    </div>
                </div>
            </footer>
            <Image.PreviewGroup
                preview={{
                    open: previewOpen,
                    current: previewIndex,
                    onOpenChange: setPreviewOpen,
                    onChange: setPreviewIndex,
                }}
            >
                <div className="hidden">
                    {promptShowcase.map((item) => (
                        <Image key={item.id} src={item.coverUrl} alt={item.title} />
                    ))}
                </div>
            </Image.PreviewGroup>
        </main>
    );
}
