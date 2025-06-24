import { Notice, TFile, TFolder, TAbstractFile, Menu, MenuItem, EventRef } from 'obsidian';
import { BaseTool } from '../../core/base/BaseTool';
import ToolboxPlugin from "../../main";
import { PathCopyConfig } from './types';
import { displayPathCopySettings } from './PathCopySettings';
import * as path from 'path';

/**
 * 路径复制工具类
 * 提供在文件列表中复制文件或文件夹的绝对路径和相对路径的功能
 */
export class PathCopyTool extends BaseTool<PathCopyConfig> {
    /**
     * 工具唯一ID
     */
    id = 'path-copy';
    /**
     * 工具显示名称
     */
    name = '路径复制';
    /**
     * 工具排序名称
     */
    sortName = 'lujingfuzhi';
    /**
     * 工具描述
     */
    description = '在文件列表中复制文件或文件夹的绝对路径和相对路径';

    /**
     * 事件监听器引用
     */
    private fileMenuListener: EventRef | null = null;
    private filesMenuListener: EventRef | null = null;
    private editorMenuListener: EventRef | null = null;
    
    /**
     * 跟踪菜单项是否已添加的标记
     */
    private static fileMenuAdded: boolean = false;
    private static filesMenuAdded: boolean = false;
    private static editorMenuAdded: boolean = false;

    /**
     * 构造函数
     * @param plugin 插件实例引用
     */
    constructor(plugin: ToolboxPlugin) {
        super(plugin);
        
        // // 确保配置项存在
        // this.config = {
        //     ...this.getDefaultConfig(),
        //     ...this.config
        // };
        
        // // 立即保存初始配置
        // this.saveSettings().then(() => {});
    }

    /**
     * 启用工具
     * 注册右键菜单项
     */
    enable(): void {
        this.registerContextMenu();
        this.registerEditorContextMenu();
    }

    /**
     * 禁用工具
     * 移除右键菜单项
     */
    disable(): void {
        // 移除事件监听器
        if (this.fileMenuListener) {
            this.plugin.app.workspace.offref(this.fileMenuListener);
            this.fileMenuListener = null;
        }
        if (this.filesMenuListener) {
            this.plugin.app.workspace.offref(this.filesMenuListener);
            this.filesMenuListener = null;
        }
        if (this.editorMenuListener) {
            this.plugin.app.workspace.offref(this.editorMenuListener);
            this.editorMenuListener = null;
        }
        
        // 重置菜单标记
        PathCopyTool.fileMenuAdded = false;
        PathCopyTool.filesMenuAdded = false;
        PathCopyTool.editorMenuAdded = false;
    }

    /**
     * 获取默认配置
     * @returns 默认配置对象
     */
    getDefaultConfig(): PathCopyConfig {
        return {
            enabled: false,
            showAbsolutePathOption: true,
            showRelativePathOption: true,
            showHierarchyOption: true,
            absolutePathMenuTitle: '复制绝对路径',
            relativePathMenuTitle: '复制相对路径',
            hierarchyMenuTitle: '复制层级结构',
            multiFileSeparator: '\n'
        };
    }

    /**
     * 验证配置有效性
     * @param config 要验证的配置对象
     * @returns 配置是否有效
     */
    validateConfig(config: PathCopyConfig): boolean {
        return (
            typeof config.enabled === 'boolean' &&
            typeof config.showAbsolutePathOption === 'boolean' &&
            typeof config.showRelativePathOption === 'boolean' &&
            typeof config.showHierarchyOption === 'boolean' &&
            typeof config.absolutePathMenuTitle === 'string' &&
            typeof config.relativePathMenuTitle === 'string' &&
            typeof config.hierarchyMenuTitle === 'string' &&
            typeof config.multiFileSeparator === 'string'
        );
    }

    /**
     * 显示工具设置界面
     * @param containerEl 设置容器元素
     */
    displaySettings(containerEl: HTMLElement): void {
        displayPathCopySettings(containerEl, this.plugin, this);
    }

    /**
     * 注册右键菜单项
     */
    private registerContextMenu(): void {
        // 先移除现有的事件监听器
        this.disable();

        // 注册文件菜单事件 - 处理单个文件的右键菜单
        const fileMenuRef = this.plugin.app.workspace.on('file-menu', (menu: Menu, file: TAbstractFile) => {
            if (!this.config.enabled) return;
            
            // 防止重复添加菜单项
            if (PathCopyTool.fileMenuAdded) return;
            PathCopyTool.fileMenuAdded = true;
            
            // 添加菜单分隔线
            menu.addSeparator();
            
            // 添加绝对路径复制选项
            if (this.config.showAbsolutePathOption) {
                menu.addItem((item: MenuItem) => {
                    item
                        .setTitle(this.config.absolutePathMenuTitle)
                        .setIcon('link')
                        .onClick(async () => {
                            await this.copyAbsolutePath(file);
                            // 重置标记，允许下次重新添加
                            PathCopyTool.fileMenuAdded = false;
                        });
                });
            }

            // 添加相对路径复制选项
            if (this.config.showRelativePathOption) {
                menu.addItem((item: MenuItem) => {
                    item
                        .setTitle(this.config.relativePathMenuTitle)
                        .setIcon('link')
                        .onClick(async () => {
                            await this.copyRelativePath(file);
                            // 重置标记，允许下次重新添加
                            PathCopyTool.fileMenuAdded = false;
                        });
                });
            }

            // 如果是文件夹，添加层级结构复制选项
            if (this.config.showHierarchyOption && file instanceof TFolder) {
                menu.addItem((item: MenuItem) => {
                    item
                        .setTitle(this.config.hierarchyMenuTitle)
                        .setIcon('folder')
                        .onClick(async () => {
                            await this.copyHierarchy(file);
                            // 重置标记，允许下次重新添加
                            PathCopyTool.fileMenuAdded = false;
                        });
                });
            }
            
            // 菜单关闭时重置标记
            setTimeout(() => {
                PathCopyTool.fileMenuAdded = false;
            }, 100);
        });
        this.fileMenuListener = fileMenuRef;
        this.plugin.registerEvent(fileMenuRef);

        // 注册多文件菜单事件 - 处理多个文件的右键菜单
        const filesMenuRef = this.plugin.app.workspace.on('files-menu', (menu: Menu, files: TAbstractFile[]) => {
            if (!this.config.enabled || files.length === 0) return;
            
            // 防止重复添加菜单项
            if (PathCopyTool.filesMenuAdded) return;
            PathCopyTool.filesMenuAdded = true;
            
            // 添加菜单分隔线
            menu.addSeparator();
            
            // 添加多文件绝对路径复制选项
            if (this.config.showAbsolutePathOption) {
                menu.addItem((item: MenuItem) => {
                    item
                        .setTitle(`${this.config.absolutePathMenuTitle} (${files.length}个文件)`)
                        .setIcon('link')
                        .onClick(async () => {
                            await this.copyMultipleAbsolutePaths(files);
                            // 重置标记，允许下次重新添加
                            PathCopyTool.filesMenuAdded = false;
                        });
                });
            }

            // 添加多文件相对路径复制选项
            if (this.config.showRelativePathOption) {
                menu.addItem((item: MenuItem) => {
                    item
                        .setTitle(`${this.config.relativePathMenuTitle} (${files.length}个文件)`)
                        .setIcon('link')
                        .onClick(async () => {
                            await this.copyMultipleRelativePaths(files);
                            // 重置标记，允许下次重新添加
                            PathCopyTool.filesMenuAdded = false;
                        });
                });
            }

            // 添加多文件层级结构复制选项
            if (this.config.showHierarchyOption) {
                menu.addItem((item: MenuItem) => {
                    item
                        .setTitle(`${this.config.hierarchyMenuTitle} (${files.length}个文件)`)
                        .setIcon('folder')
                        .onClick(async () => {
                            await this.copyMultipleHierarchies(files);
                            // 重置标记，允许下次重新添加
                            PathCopyTool.filesMenuAdded = false;
                        });
                });
            }
            
            // 菜单关闭时重置标记
            setTimeout(() => {
                PathCopyTool.filesMenuAdded = false;
            }, 100);
        });
        this.filesMenuListener = filesMenuRef;
        this.plugin.registerEvent(filesMenuRef);
    }

    /**
     * 复制文件的绝对路径
     * @param file 要复制路径的文件或文件夹
     */
    private async copyAbsolutePath(file: TAbstractFile): Promise<void> {
        try {
            const basePath = (this.plugin.app.vault.adapter as any).basePath;
            const absolutePath = path.join(basePath, file.path);
            await navigator.clipboard.writeText(absolutePath);
            new Notice(`已复制绝对路径: ${absolutePath}`);
        } catch (error) {
            console.error(`[${this.id}] 复制绝对路径时出错:`, error);
            new Notice('复制绝对路径失败');
        }
    }

    /**
     * 复制文件的相对路径
     * @param file 要复制路径的文件或文件夹
     */
    private async copyRelativePath(file: TAbstractFile): Promise<void> {
        try {
            const relativePath = file.path;
            await navigator.clipboard.writeText(relativePath);
            new Notice(`已复制相对路径: ${relativePath}`);
        } catch (error) {
            console.error(`[${this.id}] 复制相对路径时出错:`, error);
            new Notice('复制相对路径失败');
        }
    }

    /**
     * 复制文件夹的层级结构
     * @param folder 要复制层级结构的文件夹
     */
    private async copyHierarchy(folder: TFolder): Promise<void> {
        try {
            const hierarchy = this.buildHierarchy(folder);
            await navigator.clipboard.writeText(hierarchy);
            new Notice(`已复制层级结构: ${folder.path}`);
        } catch (error) {
            console.error(`[${this.id}] 复制层级结构时出错:`, error);
            new Notice('复制层级结构失败');
        }
    }

    /**
     * 复制多个文件的绝对路径
     * @param files 要复制路径的文件或文件夹数组
     */
    private async copyMultipleAbsolutePaths(files: TAbstractFile[]): Promise<void> {
        try {
            const basePath = (this.plugin.app.vault.adapter as any).basePath;
            const absolutePaths = files.map(file => path.join(basePath, file.path));
            const text = absolutePaths.join(this.config.multiFileSeparator);
            await navigator.clipboard.writeText(text);
            new Notice(`已复制 ${files.length} 个文件的绝对路径`);
        } catch (error) {
            console.error(`[${this.id}] 复制多个绝对路径时出错:`, error);
            new Notice('复制多个绝对路径失败');
        }
    }

    /**
     * 复制多个文件的相对路径
     * @param files 要复制路径的文件或文件夹数组
     */
    private async copyMultipleRelativePaths(files: TAbstractFile[]): Promise<void> {
        try {
            const relativePaths = files.map(file => file.path);
            const text = relativePaths.join(this.config.multiFileSeparator);
            await navigator.clipboard.writeText(text);
            new Notice(`已复制 ${files.length} 个文件的相对路径`);
        } catch (error) {
            console.error(`[${this.id}] 复制多个相对路径时出错:`, error);
            new Notice('复制多个相对路径失败');
        }
    }

    /**
     * 复制多个文件和文件夹的层级结构
     * @param files 要复制层级结构的文件和文件夹数组
     */
    private async copyMultipleHierarchies(files: TAbstractFile[]): Promise<void> {
        try {
            const hierarchies: string[] = [];
            
            for (const file of files) {
                if (file instanceof TFolder) {
                    hierarchies.push(this.buildHierarchy(file));
                } else {
                    hierarchies.push(file.path);
                }
            }
            
            const text = hierarchies.join(this.config.multiFileSeparator);
            await navigator.clipboard.writeText(text);
            new Notice(`已复制 ${files.length} 个文件的层级结构`);
        } catch (error) {
            console.error(`[${this.id}] 复制多个层级结构时出错:`, error);
            new Notice('复制多个层级结构失败');
        }
    }

    /**
     * 构建文件夹的层级结构
     * @param folder 要构建层级结构的文件夹
     * @param level 当前层级
     * @param isLast 是否是最后一个子文件夹
     * @returns 层级结构字符串
     */
    private buildHierarchy(folder: TFolder, level: number = 0, isLast: boolean = true): string {
        let result = '';
        const isRoot = level === 0;
        
        // 构建当前层级的缩进
        let indent = '';
        if (!isRoot) {
            indent = '│   '.repeat(level - 1);
            indent += isLast ? '└── ' : '├── ';
        }
        
        // 添加当前文件夹名称
        result += `${indent}${folder.name}${isRoot ? '' : '/'}\n`;
        
        // 处理子文件和子文件夹
        const children = folder.children;
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const isLastChild = i === children.length - 1;
            
            if (child instanceof TFolder) {
                result += this.buildHierarchy(child, level + 1, isLastChild);
            } else {
                // 文件缩进需要额外处理
                let fileIndent = '│   '.repeat(level);
                fileIndent += isLastChild ? '└── ' : '├── ';
                result += `${fileIndent}${child.name}\n`;
            }
        }
        
        return result;
    }

    /**
     * 注册编辑器右键菜单
     */
    private registerEditorContextMenu(): void {
        // 先移除现有的事件监听器
        if (this.editorMenuListener) {
            this.plugin.app.workspace.offref(this.editorMenuListener);
            this.editorMenuListener = null;
        }
        
        // 重置菜单标记
        PathCopyTool.editorMenuAdded = false;
        
        // 注册编辑器菜单事件
        const editorMenuRef = this.plugin.app.workspace.on('editor-menu', (menu, editor, view) => {
            if (!this.config.enabled) return;
            
            // 检查当前文件是否存在
            const activeFile = this.plugin.app.workspace.getActiveFile();
            if (!activeFile) return;
            
            // 防止重复添加菜单项
            if (PathCopyTool.editorMenuAdded) return;
            PathCopyTool.editorMenuAdded = true;
            
            // 添加菜单分隔线
            menu.addSeparator();
            
            // 添加粘贴当前文件绝对路径选项
            if (this.config.showAbsolutePathOption) {
                menu.addItem((item) => {
                    item
                        .setTitle('粘贴当前文件绝对路径')
                        .setIcon('link')
                        .onClick(async () => {
                            // 获取当前文件的绝对路径
                            const basePath = (this.plugin.app.vault.adapter as any).basePath;
                            const absolutePath = path.join(basePath, activeFile.path);
                            
                            // 插入当前光标位置
                            editor.replaceSelection(absolutePath);
                            
                            // 显示通知
                            new Notice('已粘贴文件绝对路径');
                            
                            // 重置标记，允许下次再次添加
                            PathCopyTool.editorMenuAdded = false;
                        });
                });
            }
            
            // 添加粘贴当前文件相对路径选项
            if (this.config.showRelativePathOption) {
                menu.addItem((item) => {
                    item
                        .setTitle('粘贴当前文件相对路径')
                        .setIcon('link')
                        .onClick(async () => {
                            // 获取当前文件的相对路径
                            const relativePath = activeFile.path;
                            
                            // 插入当前光标位置
                            editor.replaceSelection(relativePath);
                            
                            // 显示通知
                            new Notice('已粘贴文件相对路径');
                            
                            // 重置标记，允许下次再次添加
                            PathCopyTool.editorMenuAdded = false;
                        });
                });
            }
            
            // 添加粘贴当前文件所在文件夹绝对路径选项
            if (this.config.showAbsolutePathOption) {
                menu.addItem((item) => {
                    item
                        .setTitle('粘贴当前文件夹绝对路径')
                        .setIcon('folder')
                        .onClick(async () => {
                            // 获取当前文件的父文件夹路径
                            const filePath = activeFile.path;
                            const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
                            const basePath = (this.plugin.app.vault.adapter as any).basePath;
                            const absoluteFolderPath = path.join(basePath, folderPath);
                            
                            // 插入当前光标位置
                            editor.replaceSelection(absoluteFolderPath);
                            
                            // 显示通知
                            new Notice('已粘贴文件夹绝对路径');
                            
                            // 重置标记，允许下次再次添加
                            PathCopyTool.editorMenuAdded = false;
                        });
                });
            }
            
            // 添加粘贴当前文件所在文件夹相对路径选项
            if (this.config.showRelativePathOption) {
                menu.addItem((item) => {
                    item
                        .setTitle('粘贴当前文件夹相对路径')
                        .setIcon('folder')
                        .onClick(async () => {
                            // 获取当前文件的父文件夹路径
                            const filePath = activeFile.path;
                            const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
                            
                            // 插入当前光标位置
                            editor.replaceSelection(folderPath);
                            
                            // 显示通知
                            new Notice('已粘贴文件夹相对路径');
                            
                            // 重置标记，允许下次再次添加
                            PathCopyTool.editorMenuAdded = false;
                        });
                });
            }
            
            // 菜单关闭时重置标记
            setTimeout(() => {
                PathCopyTool.editorMenuAdded = false;
            }, 100);
        });
        
        // 保存事件引用并注册
        this.editorMenuListener = editorMenuRef;
        this.plugin.registerEvent(editorMenuRef);
    }
} 