import {App, Setting} from 'obsidian';
import {Tool} from '../../core/types/types';
import {SettingBuilder, SettingConfig, SettingGroup} from '../../core/base/SettingBuilder';
import ToolboxPlugin from "../../main";

// 定义设置项配置
const _TemplateSettings: SettingConfig[] = [
	{
		name: 'templatePath',
		desc: '模板文件路径',
		type: 'text',
		value: '',
		placeholder: '输入模板文件路径'
	},
	{
		name: 'autoApply',
		desc: '自动应用模板',
		type: 'toggle',
		value: false
	}
];

// 基本控件设置组
const BASIC_SETTINGS: SettingConfig[] = [
	{
		name: 'textSetting',
		desc: '文本输入框示例',
		type: 'text',
		value: '',
		placeholder: '请输入文本'
	},
	{
		name: 'toggleSetting',
		desc: '开关控件示例',
		type: 'toggle',
		value: false
	}
];

// 下拉菜单和滑块设置组
const DROPDOWN_SLIDER_SETTINGS: SettingConfig[] = [
	{
		name: 'dropdownSetting',
		desc: '下拉菜单示例',
		type: 'dropdown',
		value: 'option1',
		options: {
			'option1': '选项1',
			'option2': '选项2',
			'option3': '选项3'
		}
	},
	{
		name: 'sliderSetting',
		desc: '滑块控件示例',
		type: 'slider',
		value: 50,
		min: 0,
		max: 100,
		step: 5
	}
];

// 颜色和文件选择器设置组
const COLOR_FILE_SETTINGS: SettingConfig[] = [
	{
		name: 'colorSetting',
		desc: '颜色选择器示例',
		type: 'color',
		value: '#ff5500'
	},
	{
		name: 'fileSetting',
		desc: '文件选择器示例',
		type: 'file',
		value: '',
		fileTypes: ['md', 'txt']
	}
];

// 日期和时间设置组
const DATE_TIME_SETTINGS: SettingConfig[] = [
	{
		name: 'dateSetting',
		desc: '日期选择器示例',
		type: 'date',
		value: '',
		format: 'YYYY-MM-DD'
	},
	{
		name: 'timeSetting',
		desc: '时间选择器示例',
		type: 'time',
		value: '',
		format: 'HH:mm'
	},
	{
		name: 'datetimeSetting',
		desc: '日期时间选择器示例',
		type: 'datetime',
		value: '',
		format: 'YYYY-MM-DD HH:mm'
	}
];

// 多行文本设置组
const TEXTAREA_SETTINGS: SettingConfig[] = [
	{
		name: 'textareaSetting',
		desc: '多行文本输入框示例',
		type: 'textarea',
		value: '',
		placeholder: '请输入多行文本',
		rows: 5
	}
];

// 依赖关系示例
const DEPENDENT_SETTINGS: SettingConfig[] = [
	{
		name: 'enableDependency',
		desc: '启用依赖关系示例',
		type: 'toggle',
		value: false
	},
	{
		name: 'dependentSetting',
		desc: '仅当上面的选项开启时显示',
		type: 'text',
		value: '',
		placeholder: '这是一个依赖上面开关的设置项',
		dependsOn: {
			setting: 'enableDependency',
			value: true,
			operator: 'equals'
		}
	}
];

// 定义设置组配置
const SETTINGS_GROUPS: SettingGroup[] = [
	{
		name: '基本设置',
		desc: '工具模板的基本设置项',
		settings: _TemplateSettings
	},
	{
		name: '基本控件',
		desc: '文本和开关控件示例',
		settings: BASIC_SETTINGS
	},
	{
		name: '下拉菜单和滑块',
		desc: '下拉菜单和滑块控件示例',
		settings: DROPDOWN_SLIDER_SETTINGS
	},
	{
		name: '颜色和文件选择器',
		desc: '颜色选择器和文件选择器示例',
		settings: COLOR_FILE_SETTINGS
	},
	{
		name: '日期和时间',
		desc: '日期和时间相关控件示例',
		settings: DATE_TIME_SETTINGS
	},
	{
		name: '多行文本',
		desc: '多行文本输入框示例',
		settings: TEXTAREA_SETTINGS
	},
	{
		name: '依赖关系示例',
		desc: '演示设置项之间的依赖关系',
		settings: DEPENDENT_SETTINGS
	}
];

// 通用的设置内容显示函数
export function displayTemplateSettings(containerEl: HTMLElement, plugin: ToolboxPlugin, tool: Tool) {
	const settings = plugin.toolManager.getToolSettings(tool.id);
	const config = settings?.config || {};
	const builder = new SettingBuilder(containerEl, plugin, tool.id, config);

	// 添加所有设置组
	SETTINGS_GROUPS.forEach(group => {
		builder.addSettingsGroup(group);
	});
}
