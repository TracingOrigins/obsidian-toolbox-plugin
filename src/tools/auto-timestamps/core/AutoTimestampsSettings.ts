import {Tool} from '../../../core/types/types';
import {SettingBuilder, SettingConfig, SettingGroup} from '../../../core/base/SettingBuilder';
import ToolboxPlugin from "../../../main";

// 定义基本设置项
const BasicSettings: SettingConfig[] = [
	{
		name: 'dateFormat',
		desc: '设置时间戳的日期格式',
		type: 'text',
		value: 'YYYY-MM-DD HH:mm:ss'
	},
	{
		name: 'modifyInterval',
		desc: '修改时间的更新间隔（秒）',
		type: 'text',
		value: 10,
		placeholder: '请输入数字（单位：秒）',
		validation: {
			required: true,
			pattern: '^[1-9]\\d*$',
			custom: (value) => {
				const num = parseInt(value);
				if (isNaN(num) || num <= 0) {
					return '请输入大于0的整数';
				}
				return null;
			}
		}
	}
];

// 定义创建时间设置项
const CreatedTimeSettings: SettingConfig[] = [
	{
		name: 'enableCreatedTime',
		desc: '是否启用创建时间',
		type: 'toggle',
		value: true
	},
	{
		name: 'useFileCreationDate',
		desc: '使用文件创建日期作为created属性值（否则使用当前时间）',
		type: 'toggle',
		value: true
	}
];

// 定义修改时间设置项
const ModifiedTimeSettings: SettingConfig[] = [
	{
		name: 'enableModifiedTime',
		desc: '是否启用修改时间',
		type: 'toggle',
		value: true
	},
	{
		name: 'useFileModificationDate',
		desc: '使用文件修改日期作为modified属性值（否则使用当前时间）',
		type: 'toggle',
		value: true
	}
];

// 定义过滤设置项
const FilterSettings: SettingConfig[] = [
	{
		name: 'ignoredFolders',
		desc: '忽略的文件夹（每行一个，支持通配符）',
		type: 'textarea',
		value: '',
		placeholder: '例如：\n.templates\nattachments/*'
	},
	{
		name: 'ignoredFiles',
		desc: '忽略的文件（每行一个，支持通配符）',
		type: 'textarea',
		value: '',
		placeholder: '例如：\n*.md\n!important.md'
	},
	{
		name: 'ignoredTags',
		desc: '忽略的标签（每行一个，支持通配符）',
		type: 'textarea',
		value: '',
		placeholder: '例如：\n#draft\n#temp/*'
	}
];

// 定义设置组配置
const SETTINGS_GROUPS: SettingGroup[] = [
	{
		name: '基本设置',
		desc: '时间戳的基本配置',
		settings: BasicSettings
	},
	{
		name: '创建时间设置',
		desc: '配置创建时间的行为',
		settings: CreatedTimeSettings
	},
	{
		name: '修改时间设置',
		desc: '配置修改时间的行为',
		settings: ModifiedTimeSettings
	},
	{
		name: '过滤设置',
		desc: '配置需要忽略的文件和文件夹',
		settings: FilterSettings
	}
];

// 通用的设置内容显示函数
export function displayAutoTimestampsSettings(containerEl: HTMLElement, plugin: ToolboxPlugin, tool: Tool) {
	const settings = plugin.toolManager.getToolSettings(tool.id);
	const config = settings?.config || {};
	const builder = new SettingBuilder(containerEl, plugin, tool.id, config);

	// 添加所有设置组
	SETTINGS_GROUPS.forEach(group => {
		builder.addSettingsGroup(group);
	});
}

