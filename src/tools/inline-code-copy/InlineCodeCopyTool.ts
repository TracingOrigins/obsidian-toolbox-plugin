import { App, MarkdownPostProcessor, Notice, Setting } from 'obsidian';
import { BaseTool } from '../../core/base/BaseTool';
import { InlineCodeCopyConfig } from './types';
import ToolboxPlugin from '../../main';
import { displayInlineCodeCopySettings } from './InlineCodeCopySettings';

export class InlineCodeCopyTool extends BaseTool<InlineCodeCopyConfig> {
    public id = 'inline-code-copy';
    public name = '行内代码复制';
    public description = '点击行内代码块时自动复制其内容';

    private postProcessor: MarkdownPostProcessor | null = null;
    private lastCopyTime: number = 0;
    private copyCooldown: number = 500; // 500毫秒内不重复触发复制
    private isEnabled: boolean = false; // 添加标志来跟踪工具是否已启用

    constructor(plugin: ToolboxPlugin) {
        super(plugin);
    }

    public getDefaultConfig(): InlineCodeCopyConfig {
        return {
            enabled: false,
            showCopyNotification: true,
            copyNotificationText: '已复制代码',
            copyNotificationDuration: 2000
        };
    }

    public validateConfig(config: InlineCodeCopyConfig): boolean {
        return (
            typeof config.enabled === 'boolean' &&
            typeof config.showCopyNotification === 'boolean' &&
            typeof config.copyNotificationText === 'string' &&
            typeof config.copyNotificationDuration === 'number' &&
            config.copyNotificationDuration > 0
        );
    }

    public displaySettings(containerEl: HTMLElement): void {
        displayInlineCodeCopySettings(containerEl, this.plugin, this);
    }

    async enable(): Promise<void> {
        if (!this.config.enabled || this.isEnabled) return;
        
        this.isEnabled = true;
        this.registerMarkdownPostProcessor();
    }

    async disable(): Promise<void> {
        if (!this.isEnabled) return;
        
        this.isEnabled = false;
        this.unregisterMarkdownPostProcessor();
    }

    // 添加新方法：应用设置
    public applySettings(): void {
        // 如果工具已启用，重新注册后处理器以应用新设置
        if (this.config.enabled && this.isEnabled) {
            this.unregisterMarkdownPostProcessor();
            this.registerMarkdownPostProcessor();
        }
    }

    private registerMarkdownPostProcessor(): void {
        // 确保先取消注册之前的处理器
        this.unregisterMarkdownPostProcessor();
        
        this.postProcessor = this.plugin.registerMarkdownPostProcessor((element: HTMLElement) => {
            // 如果工具未启用，不处理任何元素
            if (!this.isEnabled || !this.config.enabled) {
                return;
            }
            
            // 查找所有行内代码元素（不包括代码块中的代码）
            const inlineCodeElements = element.querySelectorAll('code:not(pre code)');
            
            inlineCodeElements.forEach((codeElement) => {
                // 移除可能存在的旧事件监听器
                const newCodeElement = codeElement.cloneNode(true) as HTMLElement;
                codeElement.parentNode?.replaceChild(newCodeElement, codeElement);
                
                // 添加新的事件监听器
                newCodeElement.addEventListener('click', (event) => {
                    // 再次检查工具是否启用，以防在点击时工具已被禁用
                    if (!this.isEnabled || !this.config.enabled) {
                        return;
                    }
                    
                    // 防止事件冒泡和默认行为
                    event.preventDefault();
                    event.stopPropagation();
                    
                    // 防止短时间内重复触发
                    const now = Date.now();
                    if (now - this.lastCopyTime < this.copyCooldown) {
                        return;
                    }
                    this.lastCopyTime = now;
                    
                    // 复制代码内容
                    const codeContent = newCodeElement.textContent || '';
                    navigator.clipboard.writeText(codeContent).then(() => {
                        if (this.config.showCopyNotification) {
                            new Notice(this.config.copyNotificationText, this.config.copyNotificationDuration);
                        }
                    });
                });
            });
        });
    }

    private unregisterMarkdownPostProcessor(): void {
        if (this.postProcessor) {
            // 由于 Obsidian API 的限制，我们无法直接取消注册 MarkdownPostProcessor
            // 但是当插件被禁用时，Obsidian 会自动清理所有已注册的后处理器
            this.postProcessor = null;
        }
    }
}

