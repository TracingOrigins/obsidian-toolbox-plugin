import { Setting } from 'obsidian';
import ToolboxPlugin from '../../main';
import { InlineCodeCopyTool } from './InlineCodeCopyTool';

/**
 * 显示内联代码复制工具设置界面
 */
export function displayInlineCodeCopySettings(
    containerEl: HTMLElement,
    plugin: ToolboxPlugin,
    tool: InlineCodeCopyTool
): void {
    new Setting(containerEl)
        .setName('显示复制通知')
        .setDesc('复制代码时显示通知')
        .addToggle(toggle => toggle
            .setValue(tool.config.showCopyNotification)
            .onChange(async (value) => {
                tool.config.showCopyNotification = value;
                await tool.saveSettings();
                // 立即应用新设置
                tool.applySettings();
            }));

    new Setting(containerEl)
        .setName('通知文本')
        .setDesc('复制成功时显示的通知文本')
        .addText(text => text
            .setValue(tool.config.copyNotificationText)
            .onChange(async (value) => {
                tool.config.copyNotificationText = value;
                await tool.saveSettings();
                // 立即应用新设置
                tool.applySettings();
            }));

    new Setting(containerEl)
        .setName('通知持续时间')
        .setDesc('通知显示的持续时间（毫秒）')
        .addText(text => text
            .setValue(tool.config.copyNotificationDuration.toString())
            .onChange(async (value) => {
                const duration = parseInt(value);
                if (!isNaN(duration) && duration > 0) {
                    tool.config.copyNotificationDuration = duration;
                    await tool.saveSettings();
                    // 立即应用新设置
                    tool.applySettings();
                }
            }));
} 