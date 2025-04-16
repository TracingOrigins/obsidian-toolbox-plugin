import {App, Setting} from 'obsidian';
import {Tool} from '../../core/types/types';
import {SettingBuilder, SettingConfig, SettingGroup} from '../../core/base/SettingBuilder';
import ToolboxPlugin from "../../main";

// 定义设置项配置
const TabCopySettings: SettingConfig[] = [
	{
		name: 'enableDoubleClick',
		desc: '启用双击标签页时自动复制链接的功能',
		type: 'toggle',
		value: true,
	}
];

// 定义设置组配置
const SETTINGS_GROUPS: SettingGroup[] = [
	{
		name: '设置项',
		desc: '标签页复制设置',
		settings: TabCopySettings
	}
];

// 通用的设置内容显示函数
export function displayTabCopySettings(containerEl: HTMLElement, plugin: ToolboxPlugin, tool: Tool) {
	const settings = plugin.toolManager.getToolSettings(tool.id);
	const config = settings?.config || {};
	const builder = new SettingBuilder(containerEl, plugin, tool.id, config);

	// 添加所有设置组
	SETTINGS_GROUPS.forEach(group => {
		builder.addSettingsGroup(group);
	});
}


