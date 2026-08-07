const test = require('node:test');
const assert = require('node:assert/strict');
const {
  User,
  Organisation,
  Department,
  Team,
  Project,
  GithubAccount,
  GithubRepository,
  PullRequest,
} = require('./index');

test('ORM models index exports all models with valid definitions', () => {
  assert.ok(User);
  assert.ok(Organisation);
  assert.ok(Department);
  assert.ok(Team);
  assert.ok(Project);
  assert.ok(GithubAccount);
  assert.ok(GithubRepository);
  assert.ok(PullRequest);
});

test('ORM models associations are initialized correctly', () => {
  // Check User associations
  assert.ok(User.associations.ownedOrganisations);
  assert.ok(User.associations.memberTeams);
  assert.ok(User.associations.ownedProjects);
  assert.ok(User.associations.GithubAccount);

  // Check Organisation associations
  assert.ok(Organisation.associations.owner);
  assert.ok(Organisation.associations.members);
  assert.ok(Organisation.associations.Departments);
  assert.ok(Organisation.associations.Teams);

  // Check Department associations
  assert.ok(Department.associations.Organisation);
  assert.ok(Department.associations.Teams);

  // Check Team associations
  assert.ok(Team.associations.Organisation);
  assert.ok(Team.associations.Department);
  assert.ok(Team.associations.members);

  // Check Project associations
  assert.ok(Project.associations.owner);
  assert.ok(Project.associations.creator);
  assert.ok(Project.associations.GithubRepositories);
  assert.ok(Project.associations.PullRequests);

  // Check GithubAccount & GithubRepository & PullRequest associations
  assert.ok(GithubAccount.associations.User);
  assert.ok(GithubAccount.associations.GithubRepositories);
  assert.ok(GithubRepository.associations.Project);
  assert.ok(GithubRepository.associations.GithubAccount);
  assert.ok(GithubRepository.associations.PullRequests);
  assert.ok(PullRequest.associations.GithubRepository);
  assert.ok(PullRequest.associations.Project);
});

test('Project model includes syncStatus, githubPrimaryRepoId, and lastSyncedAt attributes', () => {
  const attributes = Object.keys(Project.rawAttributes);
  assert.ok(attributes.includes('name'));
  assert.ok(attributes.includes('githubPrimaryRepoId'));
  assert.ok(attributes.includes('syncStatus'));
  assert.ok(attributes.includes('lastSyncedAt'));
  assert.ok(attributes.includes('createdById'));
});
