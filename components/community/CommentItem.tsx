import { Comment } from '@/types/community';
import { format } from 'date-fns';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface CommentItemProps {
  comment: Comment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const { theme } = useTheme();
  const formattedDate = format(new Date(comment.createdAt), 'MMM d, yyyy');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.userName, { color: theme.colors.text }]}>
          {comment.names}
        </Text>
        <Text style={[styles.date, { color: theme.colors.placeholder }]}>
          {formattedDate}
        </Text>
      </View>
      <Text style={[styles.content, { color: theme.colors.text }]}>
        {comment.content}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#ccc',
    marginLeft: 8,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  date: {
    fontSize: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
});