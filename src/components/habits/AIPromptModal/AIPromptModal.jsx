import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import Modal from '../../ui/Modal/Modal';
import Button from '../../ui/Button/Button';
import styles from './AIPromptModal.module.css';

export default function AIPromptModal({ isOpen, onClose, onGenerate, habitName, isUpdate }) {
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      await onGenerate(context);
      setContext('');
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setContext('');
      setError(null);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isUpdate ? 'Update steps with AI' : 'Generate steps with AI'}
    >
      <div className={styles.content}>
        <p className={styles.desc}>
          {isUpdate
            ? `Tell us how you'd like to change the steps for "${habitName}".`
            : `Describe any specific context about how you do "${habitName}" — the more detail, the better the steps.`}
        </p>

        <textarea
          className={styles.textarea}
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder={
            isUpdate
              ? 'e.g. "Make the steps shorter" or "Add a step for setting out clothes the night before"'
              : 'e.g. "I have ADHD and need very small steps" or "I like to shower in the evening with music on"'
          }
          rows={4}
          disabled={loading}
        />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button variant="secondary" size="sm" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleGenerate} disabled={loading || !habitName?.trim()}>
            {loading ? (
              <>
                <Loader2 size={16} className={styles.spinner} /> Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} /> {isUpdate ? 'Update steps' : 'Generate steps'}
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
