import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  Attendance,
  BattlePassState,
  Competition,
  ProfileUpdate,
  Story,
  User,
  WheelSpinResult,
  WheelStatus
} from '../models/models';
import { ApiService } from './api.service';

/** Toate apelurile de business ale academiei (story-uri, battle pass, roată, prezențe). */
@Injectable({ providedIn: 'root' })
export class AcademyService {
  private readonly api = inject(ApiService);

  // ----- Profil -----
  updateProfile(payload: ProfileUpdate): Observable<User> {
    return this.api.put<User>('/users/me', payload);
  }

  uploadAvatar(file: File): Observable<User> {
    const form = new FormData();
    form.append('file', file);
    return this.api.upload<User>('/users/me/avatar', form);
  }

  // ----- Story-uri (24h) -----
  activeStories(): Observable<Story[]> {
    return this.api.get<Story[]>('/stories');
  }

  uploadStory(file: File, caption: string): Observable<Story> {
    const form = new FormData();
    form.append('file', file);
    form.append('caption', caption);
    return this.api.upload<Story>('/stories', form);
  }

  deleteStory(id: number): Observable<void> {
    return this.api.delete<void>(`/stories/${id}`);
  }

  // ----- Battle Pass -----
  battlePass(): Observable<BattlePassState> {
    return this.api.get<BattlePassState>('/battlepass/me');
  }

  claimReward(rewardId: number): Observable<BattlePassState> {
    return this.api.post<BattlePassState>(`/battlepass/claim/${rewardId}`);
  }

  // ----- Roata norocului ("Învârte-l pe Birtu") -----
  wheelStatus(): Observable<WheelStatus> {
    return this.api.get<WheelStatus>('/wheel/status');
  }

  spinWheel(): Observable<WheelSpinResult> {
    return this.api.post<WheelSpinResult>('/wheel/spin');
  }

  // ----- Competiții -----
  competitions(): Observable<Competition[]> {
    return this.api.get<Competition[]>('/competitions');
  }

  createCompetition(payload: Omit<Competition, 'id' | 'createdByName' | 'participants'>) {
    return this.api.post<Competition>('/competitions', payload);
  }

  deleteCompetition(id: number): Observable<void> {
    return this.api.delete<void>(`/competitions/${id}`);
  }

  // ----- Prezențe (antrenor) -----
  roster(): Observable<User[]> {
    return this.api.get<User[]>('/attendance/roster');
  }

  submitAttendance(date: string, presentUserIds: number[]): Observable<Attendance[]> {
    return this.api.post<Attendance[]>('/attendance', { date, presentUserIds });
  }

  myAttendance(): Observable<Attendance[]> {
    return this.api.get<Attendance[]>('/attendance/me');
  }

  // ----- Admin -----
  pendingUsers(): Observable<User[]> {
    return this.api.get<User[]>('/admin/users/pending');
  }

  approveUser(id: number): Observable<User> {
    return this.api.post<User>(`/admin/users/${id}/approve`);
  }

  rejectUser(id: number): Observable<void> {
    return this.api.delete<void>(`/admin/users/${id}`);
  }
}
