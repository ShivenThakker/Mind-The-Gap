package com.mindthegap.keyboard.api

import android.content.Context
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit

// ---- Retrofit Client Singleton ----
object ApiClient {

    private const val PREFS_NAME = "mind_the_gap_prefs"
    private const val KEY_SERVER_URL = "server_url"
    // Default loopback IP addressing host machine's localhost from Android Emulator
    private const val DEFAULT_BASE_URL = "http://10.0.2.2:3000/"

    private var retrofit: Retrofit? = null
    private var activeUrl: String = DEFAULT_BASE_URL

    fun getService(context: Context): MindTheGapService {
        val savedUrl = getServerUrl(context)
        
        // Rebuild Retrofit client if the API URL has changed
        if (retrofit == null || savedUrl != activeUrl) {
            activeUrl = savedUrl
            
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val okHttpClient = OkHttpClient.Builder()
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .addInterceptor(logging)
                .build()

            retrofit = Retrofit.Builder()
                .baseUrl(activeUrl)
                .client(okHttpClient)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
        }
        
        return retrofit!!.create(MindTheGapService::class.java)
    }

    // Retrieve active API server URL from SharedPreferences
    fun getServerUrl(context: Context): String {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        var url = prefs.getString(KEY_SERVER_URL, DEFAULT_BASE_URL) ?: DEFAULT_BASE_URL
        if (!url.endsWith("/")) {
            url += "/"
        }
        return url
    }

    // Save customized server URL
    fun setServerUrl(context: Context, url: String) {
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        var formattedUrl = url.trim()
        if (formattedUrl.isNotEmpty()) {
            if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
                formattedUrl = "https://$formattedUrl"
            }
            if (!formattedUrl.endsWith("/")) {
                formattedUrl += "/"
            }
            prefs.edit().putString(KEY_SERVER_URL, formattedUrl).apply()
        }
    }
}
