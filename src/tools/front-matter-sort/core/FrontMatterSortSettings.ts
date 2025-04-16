import {Tool} from '../../../core/types/types';
import {SettingBuilder, SettingConfig, SettingGroup} from '../../../core/base/SettingBuilder';
import ToolboxPlugin from "../../../main";

// 定义设置项配置
const FrontMatterSortSettings: SettingConfig[] = [
    {
        name: 'propertyOrder',
        desc: '属性排序顺序（每行一个属性名）',
        type: 'textarea',
        value: 'title\ndate\ntags\ncreated\nmodified',
        placeholder: '每行输入一个属性名，按照此顺序排序'
    },
    {
        name: 'autoSortOnSave',
        desc: '是否在文件保存时自动排序（不建议启用，除非某天可以禁用obsidian的自动保存）',
        type: 'toggle',
        value: true
    },
    {
        name: 'autoSortOnStartup',
        desc: '是否在启动时自动对所有文件进行排序',
        type: 'toggle',
        value: false
    },
    {
        name: 'keepUnspecifiedProperties',
        desc: '是否保持未在排序列表中指定的属性在原位置',
        type: 'toggle',
        value: true
    },
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
    }
];

// 定义设置组配置
const SETTINGS_GROUPS: SettingGroup[] = [
    {
        name: '排序设置',
        desc: '配置 Front Matter 排序工具的行为',
        settings: FrontMatterSortSettings
    }
];

// 通用的设置内容显示函数
export function displayFrontMatterSortSettings(containerEl: HTMLElement, plugin: ToolboxPlugin, tool: Tool) {
    const settings = plugin.toolManager.getToolSettings(tool.id);
    const config = settings?.config || {};
    const builder = new SettingBuilder(containerEl, plugin, tool.id, config);

    // 添加所有设置组
    SETTINGS_GROUPS.forEach(group => {
        builder.addSettingsGroup(group);
    });
} 