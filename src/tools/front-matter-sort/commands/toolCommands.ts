import {ToolCommandConfig} from '../../../core/types/types';
import {FrontMatterSortTool} from '../core/FrontMatterSortTool';
import {Notice} from 'obsidian';

/**
 * 注册工具命令
 * @param tool 工具实例
 */
export function registerToolCommands(tool: FrontMatterSortTool): void {
    // 定义命令
    const commands: ToolCommandConfig[] = [
        {
            id: 'sort-current-file-front-matter',
            name: '排序当前文件的 Front Matter',
            callback: async () => {
                const activeFile = tool.plugin.app.workspace.getActiveFile();
                if (activeFile && activeFile.extension === 'md') {
                    await tool.sortFileFrontMatter(activeFile);
                }
            }
        },
        {
            id: 'sort-all-files-front-matter',
            name: '排序所有文件的 Front Matter',
            callback: async () => {
                await tool.sortAllFilesFrontMatter();
            }
        }
    ];

    // 注册命令到工具管理器
    (tool.plugin.toolManager as any).registerToolCommands(tool.id, commands);
} 