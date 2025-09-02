'use client'

import React from 'react';
import { User, BookOpen, MessageSquare, Target, Award } from 'lucide-react';
import { VoiceProfile } from '@/lib/onboarding/voice-discovery';

interface VoiceProfileDisplayProps {
  profile: VoiceProfile;
  compact?: boolean;
}

const archetypeIcons = {
  explorer: '🔍',
  teacher: '📚',
  synthesizer: '🔗',
  implementer: '🛠️'
};

const archetypeDescriptions = {
  explorer: 'Always discovering and sharing new insights',
  teacher: 'Breaking down complex ideas for others',
  synthesizer: 'Connecting ideas across domains',
  implementer: 'Focusing on real-world application'
};

export function VoiceProfileDisplay({ profile, compact = false }: VoiceProfileDisplayProps) {
  const confidencePercentage = Math.round((profile.archetype_confidence || 0.5) * 100);
  const maturityPercentage = Math.round((profile.voice_maturity_score || 0) * 100);

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{archetypeIcons[profile.archetype as keyof typeof archetypeIcons]}</span>
            <div>
              <h4 className="font-semibold text-gray-900 capitalize">
                {profile.archetype} Voice
              </h4>
              <p className="text-sm text-gray-600">
                {confidencePercentage}% confidence
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Maturity</p>
            <p className="font-semibold text-gray-900">{maturityPercentage}%</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Your Voice Profile
          </h3>
          <span className="text-3xl">{archetypeIcons[profile.archetype as keyof typeof archetypeIcons]}</span>
        </div>
        <p className="text-gray-600">
          {archetypeDescriptions[profile.archetype as keyof typeof archetypeDescriptions]}
        </p>
      </div>

      {/* Archetype Details */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            Voice Archetype
          </h4>
          <p className="text-lg font-semibold text-blue-600 capitalize mb-1">
            The {profile.archetype}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${confidencePercentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{confidencePercentage}%</span>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Target className="w-4 h-4 text-green-600" />
            Voice Maturity
          </h4>
          <p className="text-lg font-semibold text-green-600 mb-1">
            {maturityPercentage < 30 ? 'Developing' : maturityPercentage < 70 ? 'Established' : 'Mastered'}
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{ width: `${maturityPercentage}%` }}
              />
            </div>
            <span className="text-sm text-gray-600">{maturityPercentage}%</span>
          </div>
        </div>
      </div>

      {/* Communication Style */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-purple-600" />
          Communication Style
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Vocabulary</p>
            <p className="font-semibold text-gray-900 capitalize">
              {profile.vocabulary_level || 'Professional'}
            </p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Complexity</p>
            <p className="font-semibold text-gray-900 capitalize">
              {profile.sentence_complexity || 'Moderate'}
            </p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Style</p>
            <p className="font-semibold text-gray-900 capitalize">
              {profile.engagement_style || 'Conversational'}
            </p>
          </div>
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">Research</p>
            <p className="font-semibold text-gray-900 capitalize">
              {profile.research_depth || 'Moderate'}
            </p>
          </div>
        </div>
      </div>

      {/* Expertise Areas */}
      {profile.confirmed_expertise && profile.confirmed_expertise.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            Areas of Expertise
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.confirmed_expertise.map((expertise, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
              >
                {expertise}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Natural Phrases */}
      {profile.natural_phrases && profile.natural_phrases.length > 0 && (
        <div>
          <h4 className="font-semibold text-gray-900 mb-3">
            Your Natural Phrases
          </h4>
          <div className="space-y-2">
            {profile.natural_phrases.slice(0, 5).map((phrase, index) => (
              <div
                key={index}
                className="flex items-center gap-2 text-sm text-gray-600"
              >
                <span className="text-blue-600">•</span>
                <span>{phrase}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feedback Stats */}
      <div className="bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Feedback Given</p>
            <p className="text-2xl font-bold text-gray-900">
              {profile.feedback_count || 0}
            </p>
          </div>
          {profile.last_feedback_date && (
            <div className="text-right">
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="font-semibold text-gray-900">
                {new Date(profile.last_feedback_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}