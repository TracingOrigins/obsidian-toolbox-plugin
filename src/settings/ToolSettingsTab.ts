import {App} from 'obsidian';
import {Tool} from '../core/types/types';
import {IconUtils} from '../utils/iconsUtils';
// import {displayAutoTimestampsSettings} from '../tools/auto-timestamps/AutoTimestampsTool';
import {displayTabCopySettings} from '../tools/tab-copy/TabCopySettings';
import {displayTemplateSettings} from '../tools/_template/_TemplateTool';
import ToolboxPlugin from "../main";
import {ToolSettingsRenderer} from './ToolSettingsRenderer';

/**
 * 工具设置标签页类
 * 用于在设置界面中显示和编辑单个工具的设置
 */
export class ToolSettingsTab {
	/**
	 * Obsidian 应用实例
	 */
	private app: App;
	
	/**
	 * 当前正在编辑的工具实例
	 */
	private tool: Tool;
	
	/**
	 * 插件实例引用
	 */
	private plugin: ToolboxPlugin;

	/**
	 * 设置界面的容器元素
	 */
	private containerEl: HTMLElement;
	
	/**
	 * 返回按钮的回调函数
	 */
	private onBackCallback: () => void;

	/**
	 * 构造函数
	 * @param app Obsidian 应用实例
	 * @param containerEl 设置界面的容器元素
	 * @param tool 要编辑的工具实例
	 * @param plugin 插件实例
	 * @param onBack 返回按钮的回调函数
	 */
	constructor(app: App, containerEl: HTMLElement, tool: Tool, plugin: ToolboxPlugin, onBack: () => void) {
		this.app = app;
		this.containerEl = containerEl;
		this.tool = tool;
		this.plugin = plugin;
		this.onBackCallback = onBack;
	}

	/**
	 * 显示设置界面
	 * 创建并渲染工具的设置界面
	 */
	async display(): Promise<void> {
		this.containerEl.empty();
		this.containerEl.addClass('toolbox');

		// 初始化工具设置
		await ToolSettingsRenderer.initializeToolSettings(this.plugin);

		// 渲染标题栏
		ToolSettingsRenderer.renderTitleBar(this.containerEl, this.tool.name, this.onBackCallback);

		// 渲染设置容器
		ToolSettingsRenderer.renderSettingsContainer(this.containerEl, this.tool);
	}
} 
