import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CreateBattle from './CreateBattle';

type MockResponse = {
  ok: boolean;
  json: () => Promise<unknown>;
};

const backMock = jest.fn();
const alertMock = jest.fn();

jest.mock('next/image', () => ({
  __esModule: true,
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    back: backMock,
  }),
}));

const mockPlayers = [
  {
    playerProfilesId: 'p1',
    playerName: 'Virat Kohli',
    profile: { name: 'Virat Kohli', team: 'RCB', role: 'Batter' },
  },
  {
    playerProfilesId: 'p2',
    playerName: 'Rohit Sharma',
    profile: { name: 'Rohit Sharma', team: 'MI', role: 'Batter' },
  },
  {
    playerProfilesId: 'p3',
    playerName: 'Jasprit Bumrah',
    profile: { name: 'Jasprit Bumrah', team: 'MI', role: 'Bowler' },
  },
  {
    playerProfilesId: 'p4',
    playerName: 'Ravindra Jadeja',
    profile: { name: 'Ravindra Jadeja', team: 'CSK', role: 'All-rounder' },
  },
  {
    playerProfilesId: 'p5',
    playerName: 'Shubman Gill',
    profile: { name: 'Shubman Gill', team: 'GT', role: 'Batter' },
  },
  {
    playerProfilesId: 'p6',
    playerName: 'KL Rahul',
    profile: { name: 'KL Rahul', team: 'LSG', role: 'Wicketkeeper' },
  },
];

const mockTeams = [
  { id: 't1', name: 'Mumbai Indians', city: 'Mumbai' },
  { id: 't2', name: 'Chennai Super Kings', city: 'Chennai' },
  { id: 't3', name: 'Royal Challengers Bangalore', city: 'Bengaluru' },
  { id: 't4', name: 'Kolkata Knight Riders', city: 'Kolkata' },
  { id: 't5', name: 'Delhi Capitals', city: 'Delhi' },
  { id: 't6', name: 'Sunrisers Hyderabad', city: 'Hyderabad' },
  { id: 't7', name: 'Rajasthan Royals', city: 'Jaipur' },
  { id: 't8', name: 'Punjab Kings', city: 'Mohali' },
  { id: 't9', name: 'Lucknow Super Giants', city: 'Lucknow' },
  { id: 't10', name: 'Gujarat Titans', city: 'Ahmedabad' },
];

const fetchMock = jest.fn((input: RequestInfo | URL, init?: RequestInit): Promise<MockResponse> => {
  const url = String(input);

  if (url.includes('/api/player-profile/home')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({ posts: mockPlayers }),
    });
  }

  if (url.includes('/api/team360')) {
    return Promise.resolve({
      ok: true,
      json: async () => ({ data: mockTeams }),
    });
  }

  if (url.includes('/api/battles') && init?.method === 'POST') {
    return Promise.resolve({
      ok: true,
      json: async () => ({ ok: true }),
    });
  }

  return Promise.resolve({
    ok: true,
    json: async () => ({}),
  });
});

describe('CreateBattle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = fetchMock as unknown as typeof fetch;
    window.alert = alertMock;
  });

  const renderBattle = async () => {
    render(<CreateBattle onClose={jest.fn()} />);
    await screen.findByText('Virat Kohli');
  };

  it('renders the battle builder shell and player list', async () => {
    await renderBattle();

    expect(screen.getByText('Create Battle')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g., Epic Showdown 2024')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search players...')).toBeInTheDocument();
    expect(screen.getByText('Virat Kohli')).toBeInTheDocument();
  });

  it('shows player search results with relevance-based filtering', async () => {
    await renderBattle();

    fireEvent.change(screen.getByPlaceholderText('Search players...'), {
      target: { value: 'virat' },
    });

    expect(await screen.findByText('Virat Kohli')).toBeInTheDocument();
    expect(screen.queryByText('Rohit Sharma')).not.toBeInTheDocument();
  });

  it('switches to clubs and shows all 10 IPL teams', async () => {
    await renderBattle();

    fireEvent.click(screen.getByRole('button', { name: /Clubs/i }));

    expect(await screen.findByText('Mumbai Indians')).toBeInTheDocument();
    expect(screen.getByText('Gujarat Titans')).toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(10);
  });

  it('filters clubs by city search', async () => {
    await renderBattle();

    fireEvent.click(screen.getByRole('button', { name: /Clubs/i }));
    fireEvent.change(screen.getByPlaceholderText('Search clubs...'), {
      target: { value: 'Mumbai' },
    });

    expect(await screen.findByText('Mumbai Indians')).toBeInTheDocument();
    expect(screen.queryByText('Chennai Super Kings')).not.toBeInTheDocument();
  });

  it('allows selecting players and updates the selected counter', async () => {
    await renderBattle();

    fireEvent.click(screen.getByText('Virat Kohli'));
    fireEvent.click(screen.getByText('Rohit Sharma'));

    expect(screen.getByText('2/5 selected')).toBeInTheDocument();
    expect(screen.getAllByText('Virat Kohli').length).toBeGreaterThan(1);
    expect(screen.getAllByText('Rohit Sharma').length).toBeGreaterThan(1);
  });

  it('blocks selecting more than two clubs', async () => {
    await renderBattle();

    fireEvent.click(screen.getByRole('button', { name: /Clubs/i }));
    fireEvent.click(screen.getByText('Mumbai Indians'));
    fireEvent.click(screen.getByText('Chennai Super Kings'));

    expect(screen.getByText('2/2 selected')).toBeInTheDocument();
    expect(screen.getAllByText(/Blocked - max 2 selected/i).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('checkbox').some((checkbox) => checkbox.hasAttribute('disabled'))).toBe(true);
  });

  it('shows invite suggestions when typing an existing email prefix', async () => {
    await renderBattle();

    const inviteInput = screen.getByPlaceholderText('friend@email.com');
    fireEvent.change(inviteInput, { target: { value: 'ja' } });

    expect(await screen.findByRole('button', { name: 'jane@example.com' })).toBeInTheDocument();
  });

  it('adds multiple invite emails separated by commas', async () => {
    await renderBattle();

    const inviteInput = screen.getByPlaceholderText('friend@email.com');
    fireEvent.change(inviteInput, { target: { value: 'john@example.com' } });
    fireEvent.keyDown(inviteInput, { key: 'Enter', code: 'Enter' });
    expect(await screen.findByText('john@example.com')).toBeInTheDocument();

    fireEvent.change(inviteInput, { target: { value: 'mike@example.com' } });
    fireEvent.keyDown(inviteInput, { key: 'Enter', code: 'Enter' });
    expect(await screen.findByText('mike@example.com')).toBeInTheDocument();
  });

  it('shows validation when trying to create without required data', async () => {
    await renderBattle();

    fireEvent.click(screen.getByText('Create & Send Invite'));
    expect(alertMock).toHaveBeenCalledWith('Please enter a battle name');

    fireEvent.change(screen.getByPlaceholderText('e.g., Epic Showdown 2024'), {
      target: { value: 'My Battle' },
    });
    fireEvent.click(screen.getByText('Create & Send Invite'));
    expect(alertMock).toHaveBeenCalledWith('Please select at least one item');
  });

  it('posts the battle payload and returns back on success', async () => {
    await renderBattle();

    fireEvent.change(screen.getByPlaceholderText('e.g., Epic Showdown 2024'), {
      target: { value: 'IPL Showdown' },
    });
    fireEvent.click(screen.getByText('Virat Kohli'));

    const inviteInput = screen.getByPlaceholderText('friend@email.com');
    fireEvent.change(inviteInput, { target: { value: 'john@example.com' } });
    fireEvent.keyDown(inviteInput, { key: 'Enter', code: 'Enter' });

    fireEvent.click(screen.getByText('Create & Send Invite'));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/battles',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
      expect(backMock).toHaveBeenCalled();
    });

    const postCall = fetchMock.mock.calls.find(([url, init]) => String(url).includes('/api/battles') && init?.method === 'POST');
    expect(postCall).toBeDefined();

    const body = JSON.parse(String(postCall?.[1]?.body));
    expect(body).toMatchObject({
      name: 'IPL Showdown',
      type: 'players',
      players: ['p1'],
      teams: [],
      invitedEmails: ['john@example.com'],
    });
  });
});
