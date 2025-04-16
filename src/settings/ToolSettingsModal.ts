import {App, Modal} from 'obsidian';
import {Tool} from '../core/types/types';
import {ToolManager} from '../core/manager/ToolManager';
import ToolboxPlugin from "../main";
import {ToolSettingsRenderer} from './ToolSettingsRenderer';

/**
 * 工具设置模态框类
 * 用于显示和编辑单个工具的设置
 * 继承自 Obsidian 的 Modal 类，提供模态框的基本功能
 */
export class ToolSettingsModal extends Modal {
	/**
	 * 当前正在编辑的工具实例
	 */
	protected tool: Tool;
	
	/**
	 * 插件实例引用
	 */
	protected plugin: ToolboxPlugin;
	
	/**
	 * 工具管理器实例
	 */
	protected toolManager: ToolManager;

	/**
	 * 构造函数
	 * @param app Obsidian 应用实例
	 * @param tool 要编辑的工具实例
	 * @param plugin 插件实例
	 * @param toolManager 工具管理器实例
	 */
	constructor(app: App, tool: Tool, plugin: ToolboxPlugin, toolManager: ToolManager) {
		super(app);
		this.tool = tool;
		this.plugin = plugin;
		this.toolManager = toolManager;
	}

	/**
	 * 打开模态框时的处理函数
	 * 创建模态框的UI界面
	 */
	async onOpen() {
		const {contentEl} = this;
		contentEl.empty();
		contentEl.addClass('toolbox');

		// 初始化工具设置
		await ToolSettingsRenderer.initializeToolSettings(this.plugin);

		// 渲染标题栏
		ToolSettingsRenderer.renderTitleBar(contentEl, this.tool.name, () => this.close());

		// 渲染设置容器
		ToolSettingsRenderer.renderSettingsContainer(contentEl, this.tool);
	}

	/**
	 * 关闭模态框时的处理函数
	 * 清理模态框的UI元素
	 */
	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
} 
