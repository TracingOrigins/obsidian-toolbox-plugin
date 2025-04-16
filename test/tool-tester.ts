import {Plugin} from 'obsidian';
import {Tool} from '../src/core/types/types';

/**
 * 工具测试器类
 * 用于测试工具功能是否正常
 */
export class ToolTester {
    /**
     * 测试工具功能
     * @param tool 要测试的工具
     * @param plugin 插件实例
     * @returns 测试是否通过
     */
    static testTool(tool: Tool, plugin: Plugin): boolean {
        try {
            // 测试工具启用
            tool.enable();
            
            // 测试工具禁用
            tool.disable();
            
            // 测试工具配置
            const config = tool.getDefaultConfig();
            const isValid = tool.validateConfig(config);
            
            return isValid;
        } catch (error) {
            console.error(`工具 ${tool.id} 测试失败:`, error);
            return false;
        }
    }

    /**
     * 测试工具列表
     * @param tools 要测试的工具列表
     * @param plugin 插件实例
     * @returns 测试结果映射
     */
    static testTools(tools: Tool[], plugin: Plugin): Map<string, boolean> {
        const results = new Map<string, boolean>();
        
        for (const tool of tools) {
            const result = this.testTool(tool, plugin);
            results.set(tool.id, result);
        }
        
        return results;
    }

    /**
     * 获取测试报告
     * @param results 测试结果映射
     * @returns 测试报告文本
     */
    static getTestReport(results: Map<string, boolean>): string {
        let report = '工具测试报告:\n\n';
        let passedCount = 0;
        let failedCount = 0;
        
        results.forEach((result, toolId) => {
            if (result) {
                report += `✅ ${toolId}: 通过\n`;
                passedCount++;
            } else {
                report += `❌ ${toolId}: 失败\n`;
                failedCount++;
            }
        });
        
        report += `\n总计: ${results.size} 个工具\n`;
        report += `通过: ${passedCount} 个\n`;
        report += `失败: ${failedCount} 个\n`;
        
        return report;
    }
} 
