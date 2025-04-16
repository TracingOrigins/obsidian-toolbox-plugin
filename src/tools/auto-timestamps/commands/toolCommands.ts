import {ToolCommandConfig} from '../../../core/types/types';
import {AutoTimestampsTool} from '../core/AutoTimestampsTool';

/**
 * 注册工具命令
 * @param tool 工具实例
 */
export function registerToolCommands(tool: AutoTimestampsTool): void {
	// 定义命令
	const commands: ToolCommandConfig[] = [
		{
			id: 'add-created-time-to-all-files',
			name: '为所有Markdown文档添加创建时间',
			callback: async () => {
				await tool.addCreatedTimeToAllFiles();
			}
		},
		{
			id: 'add-modified-time-to-all-files',
			name: '为所有Markdown文档添加修改时间',
			callback: async () => {
				await tool.addModifiedTimeToAllFiles();
			}
		},
		{
			id: 'add-timestamps-to-all-files',
			name: '为所有Markdown文档添加创建和修改时间',
			callback: async () => {
				await tool.addTimestampsToAllFiles();
			}
		}
	];

	// 注册命令到工具管理器
	(tool.plugin.toolManager as any).registerToolCommands(tool.id, commands);
} 
	