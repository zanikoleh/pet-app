/**
 * Pet Store (Zustand + TanStack Query hooks)
 * Manages pet list state and caching
 */

import { apiClient } from '@/services/api-client';
import * as models from '@/types/models';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// Query keys
export const petKeys = {
  all: ['pets'] as const,
  lists: () => [...petKeys.all, 'list'] as const,
  list: (pageNumber: number, pageSize: number) =>
    [...petKeys.lists(), pageNumber, pageSize] as const,
  details: () => [...petKeys.all, 'detail'] as const,
  detail: (id: string) => [...petKeys.details(), id] as const,
  search: (query: string) => [...petKeys.all, 'search', query] as const,
};

// ============================================
// Query Hooks
// ============================================

export function usePets(pageNumber = 1, pageSize = 10) {
  return useQuery({
    queryKey: petKeys.list(pageNumber, pageSize),
    queryFn: () => apiClient.getPets(pageNumber, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}

export function usePetById(id: string) {
  return useQuery({
    queryKey: petKeys.detail(id),
    queryFn: () => apiClient.getPetById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function usePetSearch(query: string) {
  return useQuery({
    queryKey: petKeys.search(query),
    queryFn: () => apiClient.searchPets(query),
    enabled: !!query && query.length > 1,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,
  });
}

// ============================================
// Mutation Hooks
// ============================================

export function useCreatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: models.CreatePetRequest) => apiClient.createPet(data),
    onSuccess: (newPet) => {
      // Invalidate pet list to trigger refetch
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
      // Add new pet to cache
      queryClient.setQueryData(petKeys.detail(newPet.id), newPet);
    },
  });
}

export function useUpdatePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { id: string; updates: models.UpdatePetRequest }) =>
      apiClient.updatePet(data.id, data.updates),
    onSuccess: (updatedPet) => {
      // Update pet detail cache
      queryClient.setQueryData(petKeys.detail(updatedPet.id), updatedPet);
      // Invalidate list to refresh
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
    },
  });
}

export function useDeletePet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => apiClient.deletePet(id),
    onSuccess: () => {
      // Invalidate pet list
      queryClient.invalidateQueries({ queryKey: petKeys.lists() });
    },
  });
}

export function useAddPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { petId: string; photo: models.AddPhotoRequest }) =>
      apiClient.addPhoto(data.petId, data.photo),
    onSuccess: (newPhoto, variables) => {
      // Invalidate pet detail to get updated photos
      queryClient.invalidateQueries({
        queryKey: petKeys.detail(variables.petId),
      });
    },
  });
}

export function useDeletePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { petId: string; photoId: string }) =>
      apiClient.deletePhoto(data.petId, data.photoId),
    onSuccess: (_, variables) => {
      // Invalidate pet detail
      queryClient.invalidateQueries({
        queryKey: petKeys.detail(variables.petId),
      });
    },
  });
}

export function useAddDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { petId: string; document: models.AddDocumentRequest }) =>
      apiClient.addDocument(data.petId, data.document),
    onSuccess: (newDocument, variables) => {
      // Invalidate pet detail
      queryClient.invalidateQueries({
        queryKey: petKeys.detail(variables.petId),
      });
    },
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { petId: string; documentId: string }) =>
      apiClient.deleteDocument(data.petId, data.documentId),
    onSuccess: (_, variables) => {
      // Invalidate pet detail
      queryClient.invalidateQueries({
        queryKey: petKeys.detail(variables.petId),
      });
    },
  });
}
