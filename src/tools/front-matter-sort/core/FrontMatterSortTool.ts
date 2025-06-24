import {TFile} from 'obsidian';
import {BaseTool} from '../../../core/base/BaseTool';
import ToolboxPlugin from "../../../main";
import {FrontMatterSortConfig} from '../types/types';
import {registerToolCommands} from '../commands/toolCommands';
import {handleFileSave} from '../handlers/fileEventHandlers';
import {shouldIgnoreFile} from '../utils/fileUtils';
import {displayFrontMatterSortSettings} from './FrontMatterSortSettings';
import {sortFrontMatter} from '../utils/frontMatterUtils';
import {Notice, Menu, EventRef} from 'obsidian';

/**
 * Front Matter 排序工具类
 * 用于自定义和自动排序文档的 front-matter 属性
 */
export class FrontMatterSortTool extends BaseTool<FrontMatterSortConfig> {
    /**
     * 工具唯一ID
     */
    id = 'front-matter-sort';
    /**
     * 工具显示名称
     */
    name = '文档属性排序';
    /**
     * 工具排序名称
     */
    sortName = 'wendangshuxingpaixu';
    /**
     * 工具描述
     */
    description = '自定义和自动排序文档的 front-matter 属性';

    /**
     * 标记是否正在处理文件
     */
    processingFile: boolean = false;

    /**
     * 文件保存事件处理函数（绑定this上下文）
     */
    private boundFileSaveHandler: (file: TFile) => Promise<void>;
    
    /**
     * 标记是否已经执行过启动时自动排序
     */
    private startupSortExecuted: boolean = false;
    
    /**
     * 标记是否已经显示过处理结果通知
     */
    private static resultNoticeShown: boolean = false;
    
    /**
     * 上次显示通知的时间戳
     */
    private static lastNoticeTime: number = 0;

    /**
     * 标记是否已添加右键菜单项
     */
    private static contextMenuAdded: boolean = false;
    
    /**
     * 编辑器菜单事件监听器引用
     */
    private editorMenuListener: EventRef | null = null;

    /**
     * 构造函数
     * @param plugin 插件实例引用
     */
    constructor(plugin: ToolboxPlugin) {
        super(plugin);
        this.boundFileSaveHandler = handleFileSave.bind(this);
    }

    /**
     * 注册工具命令
     */
    private registerToolCommands(): void {
        registerToolCommands(this);
    }

    /**
     * 注册右键菜单
     * 为编辑器添加排序front-matter的右键菜单项
     */
    private registerContextMenu(): void {
        // 先移除现有的事件监听器
        if (this.editorMenuListener) {
            this.plugin.app.workspace.offref(this.editorMenuListener);
            this.editorMenuListener = null;
        }
        
        // 重置菜单标记
        FrontMatterSortTool.contextMenuAdded = false;
        
        // 注册编辑器菜单事件
        const editorMenuRef = this.plugin.app.workspace.on('editor-menu', (menu, editor, view) => {
            // 检查当前文件是否为Markdown文件
            const activeFile = this.plugin.app.workspace.getActiveFile();
            if (!activeFile || activeFile.extension !== 'md') return;
            
            // 防止重复添加菜单项
            if (FrontMatterSortTool.contextMenuAdded) return;
            FrontMatterSortTool.contextMenuAdded = true;
            
            // 添加菜单分隔线
            menu.addSeparator();
            
            // 添加菜单项
            menu.addItem((item) => {
                item
                    .setTitle('排序 Front Matter')
                    .setIcon('list-ordered') // 使用有序列表图标，表示排序功能
                    .onClick(async () => {
                        await this.sortFileFrontMatter(activeFile);
                        // 点击后重置标记，允许下次再次添加
                        FrontMatterSortTool.contextMenuAdded = false;
                    });
            });
            
            // 菜单关闭时重置标记
            setTimeout(() => {
                FrontMatterSortTool.contextMenuAdded = false;
            }, 100);
        });
        
        // 保存事件引用并注册
        this.editorMenuListener = editorMenuRef;
        this.plugin.registerEvent(editorMenuRef);
    }

    /**
     * 启用工具
     */
    enable(): void {
        // 注册文件保存事件监听器
        this.plugin.app.vault.on('modify', this.boundFileSaveHandler);
        // 注册工具命令
        this.registerToolCommands();
        // 注册右键菜单
        this.registerContextMenu();
        
        // 延迟执行启动时自动排序，确保配置已加载
        setTimeout(() => {
            this.checkAndExecuteStartupSort();
        }, 2000);
    }
    
    /**
     * 检查并执行启动时自动排序
     */
    private checkAndExecuteStartupSort(): void {
        // 如果已经执行过启动时自动排序，则不再执行
        if (this.startupSortExecuted) {
            console.log('[FrontMatterSort] 已经执行过启动时自动排序，跳过');
            return;
        }
        
        // 如果配置了在启动时自动排序，则执行排序
        if (this.config.enabled && this.config.autoSortOnStartup) {
            console.log('[FrontMatterSort] 配置了在启动时自动排序，准备执行');
            this.startupSortExecuted = true;
            
            // 使用setTimeout确保不会与其他操作冲突
            setTimeout(() => {
                console.log('[FrontMatterSort] 开始执行启动时自动排序');
                this.sortAllFilesFrontMatter();
            }, 1000);
        } else {
            console.log('[FrontMatterSort] 未配置在启动时自动排序，跳过');
        }
    }

    /**
     * 禁用工具
     */
    disable(): void {
        // 移除事件监听器
        this.plugin.app.vault.off('modify', this.boundFileSaveHandler);
        
        // 移除编辑器菜单事件监听器
        if (this.editorMenuListener) {
            this.plugin.app.workspace.offref(this.editorMenuListener);
            this.editorMenuListener = null;
        }
        
        // 注销工具命令
        (this.plugin.toolManager as any).unregisterToolCommands(this.id);
        
        // 重置右键菜单标记
        FrontMatterSortTool.contextMenuAdded = false;
    }

    /**
     * 获取默认配置
     */
    getDefaultConfig(): FrontMatterSortConfig {
        return {
            enabled: false,
            propertyOrder: 'title\ndate\ntags\ncreated\nmodified',
            autoSortOnSave: true,
            autoSortOnStartup: false,
            keepUnspecifiedProperties: true,
            ignoredFolders: '',
            ignoredFiles: ''
        };
    }

    /**
     * 验证配置
     */
    validateConfig(config: FrontMatterSortConfig): boolean {
        return (
            typeof config.enabled === 'boolean' &&
            typeof config.propertyOrder === 'string' &&
            typeof config.autoSortOnSave === 'boolean' &&
            typeof config.autoSortOnStartup === 'boolean' &&
            typeof config.keepUnspecifiedProperties === 'boolean' &&
            typeof config.ignoredFolders === 'string' &&
            typeof config.ignoredFiles === 'string'
        );
    }

    /**
     * 显示设置界面
     */
    displaySettings(containerEl: HTMLElement): void {
        displayFrontMatterSortSettings(containerEl, this.plugin, this);
    }

    /**
     * 获取工具详细信息
     */
    get details(): string {
        return this.description;
    }

    /**
     * 配置变更处理
     */
    onConfigChange(config: FrontMatterSortConfig): void {
        const wasEnabled = this.config.enabled;
        const hadAutoSortOnStartup = this.config.autoSortOnStartup;
        
        super.onConfigChange(config);
        
        if (config.enabled) {
            this.registerToolCommands();
            
            // 只有在启用autoSortOnStartup且之前未启用过，或者之前未执行过启动排序时才执行
            if (config.autoSortOnStartup && 
                (!wasEnabled || !hadAutoSortOnStartup) && 
                !this.startupSortExecuted) {
                this.startupSortExecuted = true;
                // 不再在这里直接调用sortAllFilesFrontMatter
                // 而是使用setTimeout延迟执行，避免与其他操作冲突
                setTimeout(() => {
                    this.sortAllFilesFrontMatter();
                }, 500);
            }
        } else {
            (this.plugin.toolManager as any).unregisterToolCommands(this.id);
        }
    }

    /**
     * 检查文件是否应该被忽略
     */
    async shouldIgnoreFile(file: TFile): Promise<boolean> {
        return shouldIgnoreFile.call(this, file);
    }

    /**
     * 对文件的 front-matter 进行排序
     */
    async sortFileFrontMatter(file: TFile): Promise<void> {
        return sortFrontMatter.call(this, file);
    }
    
    /**
     * 对所有文件的 front-matter 进行排序
     */
    async sortAllFilesFrontMatter(): Promise<void> {
        // 如果正在处理文件，则不再执行
        if (this.processingFile) {
            // console.log('[FrontMatterSort] 已经在处理文件，跳过');
            return;
        }
        
        try {
            this.processingFile = true;
            // console.log('[FrontMatterSort] 开始处理所有文件');
            
            const markdownFiles = this.plugin.app.vault.getMarkdownFiles();
            let processedCount = 0;
            let skippedCount = 0;
            
            // 如果没有文件需要处理，直接返回
            if (markdownFiles.length === 0) {
                // console.log('[FrontMatterSort] 没有找到需要处理的Markdown文件');
                new Notice('没有找到需要处理的Markdown文件');
                return;
            }
            
            // console.log(`[FrontMatterSort] 找到 ${markdownFiles.length} 个Markdown文件`);
            
            // 不使用进度通知，避免重复通知问题
            
            for (let i = 0; i < markdownFiles.length; i++) {
                const file = markdownFiles[i];
                
                if (await this.shouldIgnoreFile(file)) {
                    skippedCount++;
                    continue;
                }
                
                try {
                    await this.sortFileFrontMatter(file);
                    processedCount++;
                } catch (error) {
                    console.error(`[${this.id}] 处理文件 ${file.path} 时出错:`, error);
                }
            }
            
            // console.log(`[FrontMatterSort] 处理完成: 已处理 ${processedCount} 个文件，跳过 ${skippedCount} 个文件`);
            
            // 使用静态变量跟踪通知，确保只显示一次
            const now = Date.now();
            if ((processedCount > 0 || skippedCount > 0) && 
                (!FrontMatterSortTool.resultNoticeShown || now - FrontMatterSortTool.lastNoticeTime > 5000)) {
                FrontMatterSortTool.resultNoticeShown = true;
                FrontMatterSortTool.lastNoticeTime = now;
                new Notice(`已处理 ${processedCount} 个文件，跳过 ${skippedCount} 个文件`);
            }
        } finally {
            this.processingFile = false;
        }
    }
} 