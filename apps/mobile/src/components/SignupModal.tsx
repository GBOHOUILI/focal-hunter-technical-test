import { useState } from "react";
import { Modal, View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useSignupMutation } from "../hooks/useSignupMutation";
import { ApiError } from "../api/client";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  visible: boolean;
  productId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function SignupModal({ visible, productId, onClose, onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [clientError, setClientError] = useState<string | null>(null);
  const mutation = useSignupMutation(productId);

  function handleSubmit() {
    setClientError(null);

    if (!email.trim()) {
      setClientError("L'adresse e-mail est requise");
      return;
    }
    if (!EMAIL_REGEX.test(email.trim())) {
      setClientError("Cette adresse e-mail n'est pas valide");
      return;
    }

    mutation.mutate(email.trim(), {
      onSuccess: () => {
        setEmail("");
        onClose();
        onSuccess();
      },
    });
  }

  function getServerErrorMessage(): string | null {
    if (!mutation.isError) return null;
    const err = mutation.error;

    if (err instanceof ApiError) {
      if (err.statusCode === 409) return "Vous êtes déjà inscrit pour ce produit.";
      if (err.statusCode === 400) return "Cette adresse e-mail n'est pas valide.";
      return err.message;
    }
    return "Impossible de contacter le serveur. Vérifiez votre connexion.";
  }

  const displayedError = clientError ?? getServerErrorMessage();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Ajouter à ma liste</Text>
          <Text style={styles.subtitle}>
            Recevez un e-mail de rappel pour ce produit.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="votre@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!mutation.isPending}
          />

          {displayedError && <Text style={styles.errorText}>{displayedError}</Text>}

          <Pressable
            style={[styles.submitButton, mutation.isPending && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Confirmer</Text>
            )}
          </Pressable>

          <Pressable onPress={onClose} disabled={mutation.isPending}>
            <Text style={styles.cancelText}>Annuler</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  sheet: { backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  title: { fontSize: 18, fontWeight: "700", color: "#1a1a1a" },
  subtitle: { fontSize: 13, color: "#666", marginTop: 4, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 10, padding: 12, fontSize: 15 },
  errorText: { color: "#a91e1e", fontSize: 13, marginTop: 8 },
  submitButton: { backgroundColor: "#0B5D4A", borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 16 },
  submitButtonDisabled: { opacity: 0.6 },
  submitButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  cancelText: { textAlign: "center", color: "#888", marginTop: 12, fontSize: 14 },
});
