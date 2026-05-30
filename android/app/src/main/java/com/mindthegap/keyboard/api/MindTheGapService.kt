package com.mindthegap.keyboard.api

import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.POST

// ---- Retrofit API Service Interface ----
interface MindTheGapService {

    @POST("api/analyze")
    fun analyzeMessage(@Body request: AnalyzeRequest): Call<AnalyzeResponse>

    @POST("api/opener")
    fun generateOpener(@Body request: OpenerRequest): Call<OpenerResponse>

    @POST("api/feedback")
    fun submitFeedback(@Body request: FeedbackRequest): Call<FeedbackResponse>

    @retrofit2.http.GET("api/health")
    fun checkHealth(): Call<HealthResponse>
}

// ---- Data Models ----

data class HealthResponse(
    val status: String,
    val timestamp: Long
)

data class ContextMessage(
    val role: String, // "them" or "you"
    val text: String
)

data class AnalyzeRequest(
    val message: String,
    val mode: String,
    val helpLevel: Int,
    val responseStyle: String,
    val context: List<ContextMessage> = emptyList(),
    val personDescription: String = ""
)

data class Interpretation(
    val text: String,
    val confidence: String // "high", "medium", "low"
)

data class Tone(
    val label: String,
    val explanation: String,
    val warmth: Int
)

data class Reply(
    val text: String,
    val intent: String,
    val rationale: String
)

data class AnalyzeResponse(
    val reasoning: String,
    val interpretations: List<Interpretation>,
    val tone: Tone,
    val notices: List<String>,
    val replies: List<Reply>
)

data class OpenerRequest(
    val context: String,
    val mode: String
)

data class OpenerResponse(
    val safe: String,
    val risky: String,
    val unhinged: String
)

data class FeedbackRequest(
    val analysisId: String,
    val platform: String = "android_keyboard",
    val rating: String, // "accurate", "partial", "wrong", "dismissed"
    val message: String,
    val aiAnalysis: AnalyzeResponse
)

data class FeedbackResponse(
    val success: Boolean,
    val message: String
)
