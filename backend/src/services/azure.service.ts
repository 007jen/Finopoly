/* --- AZURE CLOUD START --- */

import { DocumentAnalysisClient, AzureKeyCredential } from "@azure/ai-form-recognizer";
import { AzureOpenAI } from "openai";

/**
 * AzureService
 * 
 * A centralized, robust service for all Microsoft Azure AI integrations.
 * Designed to fail gracefully if keys are missing or services are down.
 */
export class AzureService {
    public static docClient: DocumentAnalysisClient | null = null;
    private static openAIClient: AzureOpenAI | null = null;

    private static init() {
        try {
            const docEndpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
            const docKey = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;

            if (docEndpoint && docKey) {
                this.docClient = new DocumentAnalysisClient(docEndpoint, new AzureKeyCredential(docKey));
            }

            const openAIEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
            const openAIKey = process.env.AZURE_OPENAI_KEY;

            if (openAIEndpoint && openAIKey) {
                this.openAIClient = new AzureOpenAI({
                    endpoint: openAIEndpoint,
                    apiKey: openAIKey,
                    deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "finopoly-copilot",
                    apiVersion: "2024-02-01" // More stable version
                });
            }
        } catch (error) {
            console.error("Failed to initialize Azure clients:", error);
        }
    }

    /**
     * analyzeInvoice (Pivoted to Semantic Explanation)
     * Uses Azure OpenAI to interpret the digital invoice data and provide an audit explanation.
     */
    static async analyzeInvoice(invoiceData: any) {
        if (!this.openAIClient) this.init();
        if (!this.openAIClient) return { explanation: "AI Analyst is currently offline." };

        try {
            const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "finopoly-copilot";
            const messages: any[] = [
                {
                    role: "system",
                    content: "You are a professional Financial Audit Analyst. Analyze the provided digital invoice data and explain what a junior auditor should verify. Mention potential risks or specific ledger accounts involved. Keep it concise but professional. Do NOT use markdown bolding (like **text**) or any other markdown formatting. Use plain text only."
                },
                { role: "user", content: `Invoice Data: ${JSON.stringify(invoiceData)}` }
            ];

            const result = await this.openAIClient.chat.completions.create({
                messages,
                model: deploymentName // Explicitly pass deployment name
            });

            return {
                explanation: result.choices[0].message?.content || "No analysis available."
            };
        } catch (error: any) {
            console.error("Azure OpenAI Analysis Error:", error);
            // Return a more helpful error hint if possible
            const hint = error?.message?.includes("404") ? "Deployment not found. Check AZURE_OPENAI_DEPLOYMENT_NAME." :
                error?.message?.includes("401") ? "API Key invalid. Check AZURE_OPENAI_KEY." :
                    error?.message || "Error connecting to Azure OpenAI.";
            return { explanation: `I hit a snag: ${hint}` };
        }
    }


    /**
     * analyzeCommunityMessage
     * Uses Azure OpenAI to detect foul language or threats.
     */
    static async analyzeCommunityMessage(content: string) {
        if (!this.openAIClient) this.init();
        if (!this.openAIClient) return { isSafe: true };

        try {
            const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "finopoly-copilot";
            const messages: any[] = [
                {
                    role: "system",
                    content: "You are the 'Foul Police' for a professional financial educational app. Analyze the message for any foul language (even mild ones like 'hell' or 'shit' if used aggressively), threats, or harassment. This is a workspace for students. Be strict. Respond ONLY in JSON: { \"isSafe\": boolean, \"reason\": \"string\" }"
                },
                { role: "user", content: content }
            ];

            const result = await this.openAIClient.chat.completions.create({
                messages,
                model: deploymentName,
                response_format: { type: "json_object" }
            });

            const contentText = result.choices[0].message?.content || '{"isSafe": true}';
            const parsed = JSON.parse(contentText);
            console.log(`🛡️ Community Shield Check [${content}]:`, parsed);
            return parsed;
        } catch (error) {
            console.error("Sentiment Analysis Error:", error);
            return { isSafe: true };
        }
    }
}

/* --- AZURE CLOUD END --- */
