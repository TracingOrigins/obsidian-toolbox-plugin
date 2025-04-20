import { Setting } from 'obsidian';
import ToolboxPlugin from '../../main';
import { PathCopyTool } from './PathCopyTool';

/**
 * 显示路径复制工具的设置界面
 * @param containerEl 设置容器元素
 * @param plugin 插件实例
 * @param tool 工具实例
 */
export function displayPathCopySettings(
    containerEl: HTMLElement,
    plugin: ToolboxPlugin,
    tool: PathCopyTool
): void {
    containerEl.empty();
    containerEl.createEl('h3', { text: '路径复制设置' });

    // 显示设置说明文字
    containerEl.createEl('p', { 
        text: '配置路径复制工具的行为和显示选项',
        cls: 'setting-item-description' 
    });

    // 显示绝对路径选项设置
    new Setting(containerEl)
        .setName('显示绝对路径选项')
        .setDesc('在右键菜单中显示复制绝对路径的选项')
        .addToggle(toggle => toggle
            .setValue(tool.config.showAbsolutePathOption)
            .onChange(async (value) => {
                tool.config.showAbsolutePathOption = value;
                await tool.saveSettings();
            }));

    // 显示相对路径选项设置
    new Setting(containerEl)
        .setName('显示相对路径选项')
        .setDesc('在右键菜单中显示复制相对路径的选项')
        .addToggle(toggle => toggle
            .setValue(tool.config.showRelativePathOption)
            .onChange(async (value) => {
                tool.config.showRelativePathOption = value;
                await tool.saveSettings();
            }));

    // 显示层级结构选项设置
    new Setting(containerEl)
        .setName('显示层级结构选项')
        .setDesc('在右键菜单中显示复制层级结构的选项')
        .addToggle(toggle => toggle
            .setValue(tool.config.showHierarchyOption)
            .onChange(async (value) => {
                tool.config.showHierarchyOption = value;
                await tool.saveSettings();
            }));

    // 绝对路径菜单项标题设置
    new Setting(containerEl)
        .setName('绝对路径菜单项标题')
        .setDesc('设置复制绝对路径选项在右键菜单中显示的标题')
        .addText(text => text
            .setPlaceholder('复制绝对路径')
            .setValue(tool.config.absolutePathMenuTitle)
            .onChange(async (value) => {
                tool.config.absolutePathMenuTitle = value;
                await tool.saveSettings();
            }));

    // 相对路径菜单项标题设置
    new Setting(containerEl)
        .setName('相对路径菜单项标题')
        .setDesc('设置复制相对路径选项在右键菜单中显示的标题')
        .addText(text => text
            .setPlaceholder('复制相对路径')
            .setValue(tool.config.relativePathMenuTitle)
            .onChange(async (value) => {
                tool.config.relativePathMenuTitle = value;
                await tool.saveSettings();
            }));
            
    // 层级结构菜单项标题设置
    new Setting(containerEl)
        .setName('层级结构菜单项标题')
        .setDesc('设置复制层级结构选项在右键菜单中显示的标题')
        .addText(text => text
            .setPlaceholder('复制层级结构')
            .setValue(tool.config.hierarchyMenuTitle)
            .onChange(async (value) => {
                tool.config.hierarchyMenuTitle = value;
                await tool.saveSettings();
            }));
            
    // 多文件路径分隔符设置
    new Setting(containerEl)
        .setName('多文件路径分隔符')
        .setDesc('设置复制多个文件路径时使用的分隔符')
        .addText(text => text
            .setPlaceholder('\n')
            .setValue(tool.config.multiFileSeparator)
            .onChange(async (value) => {
                tool.config.multiFileSeparator = value;
                await tool.saveSettings();
            }));
} 