
import React from 'react';
import { render, screen } from '@testing-library/react';
import { NoteAnalysis } from '../NoteAnalysis';

describe('NoteAnalysis component', () => {
  it('should render nothing when analysis is null', () => {
    const { container } = render(<NoteAnalysis analysis={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('should render AI Analysis title', () => {
    render(<NoteAnalysis analysis={{}} />);
    expect(screen.getByText('AI Analysis')).toBeInTheDocument();
  });

  it('should render next actions as a list when it is an array', () => {
    const analysis = {
      next_actions: ['Call the client', 'Send proposal', 'Schedule follow-up']
    };
    
    render(<NoteAnalysis analysis={analysis} />);
    
    expect(screen.getByText('Recommended Next Actions:')).toBeInTheDocument();
    expect(screen.getByText('Call the client')).toBeInTheDocument();
    expect(screen.getByText('Send proposal')).toBeInTheDocument();
    expect(screen.getByText('Schedule follow-up')).toBeInTheDocument();
  });

  it('should render next actions as a single item when it is a string', () => {
    const analysis = {
      next_actions: 'Call the client'
    };
    
    render(<NoteAnalysis analysis={analysis} />);
    
    expect(screen.getByText('Recommended Next Actions:')).toBeInTheDocument();
    expect(screen.getByText('Call the client')).toBeInTheDocument();
  });

  it('should render key points as a list when it is an array', () => {
    const analysis = {
      key_points: ['Client is interested', 'Price is a concern', 'Timeline is critical']
    };
    
    render(<NoteAnalysis analysis={analysis} />);
    
    expect(screen.getByText('Key Points:')).toBeInTheDocument();
    expect(screen.getByText('Client is interested')).toBeInTheDocument();
    expect(screen.getByText('Price is a concern')).toBeInTheDocument();
    expect(screen.getByText('Timeline is critical')).toBeInTheDocument();
  });

  it('should render key points as a single item when it is a string', () => {
    const analysis = {
      key_points: 'Client is interested'
    };
    
    render(<NoteAnalysis analysis={analysis} />);
    
    expect(screen.getByText('Key Points:')).toBeInTheDocument();
    expect(screen.getByText('Client is interested')).toBeInTheDocument();
  });

  it('should render both next actions and key points when both are present', () => {
    const analysis = {
      next_actions: ['Call the client'],
      key_points: ['Client is interested']
    };
    
    render(<NoteAnalysis analysis={analysis} />);
    
    expect(screen.getByText('Recommended Next Actions:')).toBeInTheDocument();
    expect(screen.getByText('Call the client')).toBeInTheDocument();
    
    expect(screen.getByText('Key Points:')).toBeInTheDocument();
    expect(screen.getByText('Client is interested')).toBeInTheDocument();
  });

  it('should not render next actions section when it is not present', () => {
    const analysis = {
      key_points: ['Client is interested']
    };
    
    render(<NoteAnalysis analysis={analysis} />);
    
    expect(screen.queryByText('Recommended Next Actions:')).not.toBeInTheDocument();
    expect(screen.getByText('Key Points:')).toBeInTheDocument();
  });

  it('should not render key points section when it is not present', () => {
    const analysis = {
      next_actions: ['Call the client']
    };
    
    render(<NoteAnalysis analysis={analysis} />);
    
    expect(screen.getByText('Recommended Next Actions:')).toBeInTheDocument();
    expect(screen.queryByText('Key Points:')).not.toBeInTheDocument();
  });
});
